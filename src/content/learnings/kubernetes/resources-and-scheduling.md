---
title: "Resources and Scheduling"
description: "Reserve CPU and memory, understand what happens past a limit, and control which node a Pod lands on."
order: 6
topic: "kubernetes"
---

## Requests and limits

```yaml
spec:
  containers:
    - name: web
      image: nginx:alpine
      resources:
        requests: # the floor: guaranteed
          cpu: "100m"
          memory: "64Mi"
        limits: # the ceiling: maximum allowed
          cpu: "250m"
          memory: "128Mi"
```

This container is **guaranteed** 100m CPU and 64Mi memory and may **burst** to 250m and 128Mi, but no higher.

### Units

- **CPU uses millicores (`m`).** `1000m` equals `1`, one full core. `500m` is half a core. `100m` is one-tenth, which is plenty for a quiet web server.
- **Memory is measured in bytes, usually `Mi`.** `Mi` is a mebibyte (1024 × 1024 bytes, about 1 MB), as in `64Mi` or `128Mi`. `Gi` is a gibibyte.

### Requests vs limits

| Aspect       | Request                                                  | Limit                                     |
| ------------ | -------------------------------------------------------- | ----------------------------------------- |
| Role         | What the container is **guaranteed** (the floor)         | The most it may **use** (the ceiling)     |
| When it acts | At **scheduling time**, when it reserves space on a node | **Continuously** while the container runs |

### What happens when a limit is exceeded

| Resource               | Exceeding the limit                       | Container status            | Diagnostic signal                                                                         | Fix                            |
| ---------------------- | ----------------------------------------- | --------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------ |
| **Memory** (hard stop) | The kernel kills it: **`OOMKilled`**      | Restarted, and it can loop  | Rising `RESTARTS` in `kubectl get pods`; `describe pod` shows `OOMKilled` (exit code 137) | Raise the memory limit         |
| **CPU** (soft limit)   | **Throttled** (slowed down), never killed | Stays `Running`, but slower | Higher latency, and **no** restarts                                                       | Raise the CPU limit or request |

### How requests drive node placement

- The scheduler computes a node's available capacity as **allocatable capacity minus the sum of existing Pods' requests**, not their current usage.
- A Pod's requested resources stay **reserved even when idle**.
- A Pod can be scheduled **only if** a node's remaining unreserved capacity is at least the Pod's request.
- If no node fits, Kubernetes will not squeeze it in. The Pod stays **`Pending`** until capacity appears, either because another Pod is deleted or a node is added.

## The scheduler and Pod placement

The **scheduler** is a control-plane process whose only job is to assign unscheduled Pods to nodes. A new Pod starts `Pending` with no node. The scheduler notices it and runs three steps:

1. **Filter** by dropping nodes that lack CPU or memory, or that violate placement rules.
2. **Score** the remaining nodes.
3. **Bind** the Pod to the best node, after which kubelet starts it.

- **Default:** with no rules, Pods spread across healthy workers by available capacity.
- **Custom placement**, such as database Pods on SSD nodes, uses three tools:

| Tool                   | What it does                                                  |
| ---------------------- | ------------------------------------------------------------- |
| `nodeSelector`         | Simple exact key-value match that pins Pods to labelled nodes |
| `nodeAffinity`         | More expressive rules, hard or soft                           |
| Taints and tolerations | Let nodes **repel** Pods that lack permission                 |

Check where a Pod landed with `kubectl get pods -o wide`.

### nodeSelector

1. **Label the node:** `kubectl label node kind-worker disktype=ssd`
2. **Add `nodeSelector` to the Pod.** It must match the label exactly:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: db
spec:
  nodeSelector:
    disktype: ssd
  containers:
    - name: db
      image: nginx:alpine
```

The scheduler keeps `kind-worker` when it has `disktype=ssd` and discards `kind-worker2` when it has `disktype=hdd`.

> If no node has the label, or you mistype the key or value, the Pod stays **`Pending`** until a matching node appears. `kubectl get nodes --show-labels` shows all node labels.

### nodeAffinity

Node affinity is an upgraded `nodeSelector`: the same node labels, but with **operators** and **soft preferences**.

| Type                                              | Treated as                   | If no node matches                 |
| ------------------------------------------------- | ---------------------------- | ---------------------------------- |
| `requiredDuringSchedulingIgnoredDuringExecution`  | **Hard rule** (must match)   | Pod sits in `Pending`              |
| `preferredDuringSchedulingIgnoredDuringExecution` | **Soft wish** (nice to have) | Pod goes to another available node |

`IgnoredDuringExecution` means that if node labels change _after_ the Pod is running, it is not evicted or moved.

| Operator | Meaning                                                               |
| -------- | --------------------------------------------------------------------- |
| `In`     | Label value is in a list (`ssd` or `nvme`)                            |
| `NotIn`  | Keep the Pod **off** nodes with these values (for example, not `hdd`) |
| `Exists` | Node has the label key, with any value                                |

A hard rule must run on a node with `disktype` equal to `ssd` or `nvme`:

```yaml
spec:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
          - matchExpressions:
              - key: disktype
                operator: In
                values: ["ssd", "nvme"]
```

A soft wish prefers `ssd`, but the Pod can run elsewhere if none is available:

```yaml
spec:
  affinity:
    nodeAffinity:
      preferredDuringSchedulingIgnoredDuringExecution:
        - weight: 80
          preference:
            matchExpressions:
              - key: disktype
                operator: In
                values: ["ssd"]
```

**Which to use?** Use `nodeSelector` for a simple exact match because it is shorter and easier to read. Use node affinity for soft wishes, multiple allowed values, or negative matching.

### Taints and tolerations

Think of a node as a room and a Pod as a person. A **taint** on the node is a "No Entry" sign. A **toleration** on the Pod is a pass that lets it ignore the sign.

An ordinary Pod is blocked by a node tainted `dedicated=logging:NoSchedule`. A Pod with a matching toleration is allowed in.

1. **Taints repel.** The scheduler excludes the node for normal Pods.
2. **Tolerations allow, but do not force.** To force a Pod onto the node, pair the toleration with a `nodeSelector`.
3. **Control-plane nodes** carry a default `NoSchedule` taint so app Pods do not run on the cluster's control plane.

| Taint effect       | Behaviour                                                   |
| ------------------ | ----------------------------------------------------------- |
| `NoSchedule`       | New Pods without a toleration are not scheduled here        |
| `PreferNoSchedule` | The scheduler tries to avoid the node but may use it        |
| `NoExecute`        | Also **evicts** already-running Pods that lack a toleration |

```bash
# kubectl taint node <node> <key>=<value>:<effect>
kubectl taint node kind-worker2 dedicated=logging:NoSchedule

# remove it: same key with a trailing minus
kubectl taint node kind-worker2 dedicated-
```

```yaml
spec:
  tolerations:
    - key: "dedicated"
      operator: "Equal"
      value: "logging"
      effect: "NoSchedule"
  containers:
    - name: logger
      image: nginx:alpine
```
