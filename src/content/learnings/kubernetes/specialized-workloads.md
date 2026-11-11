---
title: "Specialized Workloads"
description: "Choose one Pod, one Pod per node, or stable numbered Pods when a Deployment is the wrong shape."
order: 9
topic: "kubernetes"
---

## Multi-container Pods

The default is **one container per Pod**. Multiple containers in one Pod are for a tightly coupled team. Containers in the same Pod share:

- **Network:** the same IP, so they talk through `localhost`.
- **Storage:** they can share volumes, such as an `emptyDir`.
- **Lifecycle:** they are scheduled, started, and deleted **together**.

| Same Pod                                                                                                | Separate Pods                                                               |
| ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| One container is a **helper** for the main app, such as a log collector, security proxy, or init script | Two distinct applications, such as a web frontend and a backend or database |

> **Golden test:** "Will I ever want to scale, update, or restart these two containers independently?" **Yes means separate Pods.** **No, because they live and die together, means the same Pod.**

## DaemonSets

Some workloads are **system tools** that need **exactly one copy per node**: log collectors that read each node's log files, monitoring agents that report per-node CPU and memory, and network plugins that set up networking on every node. Add a sixth node and it needs its own copy immediately.

A **Deployment** fails here. It keeps a fixed count and places Pods wherever there is room. Coverage can be uneven, so a node with no agent loses its logs. Two agents can fight over one node's files, and a new node gets nothing.

A **DaemonSet** runs **exactly one Pod on every node**. A DaemonSet named `node-agent` places one Pod on Node A, Node B, and Node C. When Node D joins, a Pod is created there automatically.

The manifest looks like a Deployment but **has no `replicas` field**. Kubernetes derives the count from the number of nodes.

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: node-agent
spec:
  selector:
    matchLabels:
      app: node-agent
  template:
    metadata:
      labels:
        app: node-agent
    spec:
      containers:
        - name: agent
          image: busybox
          command: ["sleep", "3600"]
```

`kubectl get ds` shows **DESIRED** as the number of eligible nodes and **CURRENT** / **READY** as the Pods actually running. It is healthy when READY equals DESIRED.

| Aspect         | Deployment                        | DaemonSet                                              |
| -------------- | --------------------------------- | ------------------------------------------------------ |
| Count set by   | You (`replicas: N`)               | Kubernetes (equal to the number of nodes)              |
| Placement      | Wherever room is available        | Exactly 1 Pod per node                                 |
| New node joins | Nothing changes                   | A Pod is created on it automatically                   |
| Best for       | Web apps, microservices, and APIs | Log collectors, monitoring agents, and network plugins |
| Short command  | `kubectl get deploy`              | `kubectl get ds`                                       |

## StatefulSets

A **StatefulSet** runs a set of Pods like a Deployment but promises one more thing: each Pod gets a **stable, predictable name** it keeps for life, even across restarts. Names are numbered from 0. A StatefulSet `web` with `replicas: 3` creates `web-0`, `web-1`, and `web-2`.

| Object      | Pod names                                      | If a Pod dies                                                |
| ----------- | ---------------------------------------------- | ------------------------------------------------------------ |
| Deployment  | `web-app-7d9f8c-abcde`, `web-app-7d9f8c-xk2p9` | Replaced by a **new Pod with a new random name**             |
| StatefulSet | `web-0`, `web-1`, `web-2`                      | Replaced by a **new Pod with the exact same name** (`web-1`) |

**Why it matters:** cluster members such as database replicas always know who is who, and storage can be reattached. If `web-1` crashes, its disk reconnects to the new `web-1`.

Compared with a Deployment, the manifest adds two things: **`serviceName`**, which links to a Headless Service, and **`volumeClaimTemplates`**, which creates one volume per Pod.

### Headless Service

A normal Service is a load balancer that hides Pods behind one virtual IP. A **Headless Service** sets `clusterIP: None`. There is no load balancing. Instead, **each Pod gets its own stable DNS name**.

```text
Standard Service:  Traffic → [Virtual IP] → any Pod (web-0, web-1, or web-2)
Headless Service:  Traffic → DNS lookup → one specific Pod (for example, web-0)
```

The DNS pattern is `<pod>.<service>.<namespace>.svc.cluster.local`, for example `web-0.web.default.svc.cluster.local`.

| Part           | Value               | Meaning                      |
| -------------- | ------------------- | ---------------------------- |
| Pod name       | `web-0`             | The Pod's stable identity    |
| Service name   | `web`               | The Headless Service         |
| Namespace      | `default`           | Where the Service lives      |
| Cluster domain | `svc.cluster.local` | Standard internal DNS suffix |

Databases need to reach **specific** members, such as primary `web-0` for writes and replicas for reads. A StatefulSet and a Headless Service **always work as a pair**. The Service gives per-Pod DNS names, and the StatefulSet gives the matching stable Pods. `serviceName` must match the Service name.

### One disk per Pod

If you attach one hand-made PVC to a Deployment or StatefulSet, **all Pods share one disk**, which is a corruption risk for a database. `volumeClaimTemplates` acts as a factory that creates a **unique PVC per Pod**.

StatefulSet `web` creates Pod `web-0` with PVC `data-web-0` and Disk 0, Pod `web-1` with `data-web-1` and Disk 1, and Pod `web-2` with `data-web-2` and Disk 2.

PVC naming is `<template-name>-<statefulset-name>-<pod-number>`. With template `data` and StatefulSet `web`, that is `data-web-0` and `data-web-1`. **Data follows identity.** A replacement `web-1` reconnects to `data-web-1`. Pods never read or overwrite each other's files.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web
spec:
  clusterIP: None # headless
  selector:
    app: web
  ports:
    - port: 80
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: web
spec:
  serviceName: "web" # must match the headless Service name
  replicas: 2
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: nginx
          image: nginx:alpine
          volumeMounts:
            - name: data
              mountPath: /data
  volumeClaimTemplates:
    - metadata:
        name: data # must match the volumeMounts name
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 100Mi
```

Inspect the per-Pod claims with `kubectl get pvc`.

## Choosing a workload type

| Aspect       | Deployment                  | StatefulSet                     | DaemonSet          |
| ------------ | --------------------------- | ------------------------------- | ------------------ |
| Pod identity | Random and disposable       | Stable numbered names           | One per node       |
| Storage      | Shared or none              | Dedicated PVC per Pod           | Usually node-local |
| Typical use  | Stateless web apps and APIs | Databases and clustered systems | Node agents        |
