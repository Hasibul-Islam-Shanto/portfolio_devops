---
title: "Services and Ingress"
description: "Give Pods a stable address, choose a Service type, and route external HTTP traffic with Ingress."
order: 4
topic: "kubernetes"
---

## Services

A **Service** is a stable gateway for a group of Pods. Its IP and DNS name stay the same for the Service's lifetime. Because Pods are ephemeral and their IPs change, clients talk to the Service. It **load-balances** across the active Pods and updates its routing when Pods crash, scale, or are replaced.

| Command                                                                     | Purpose                                                       |
| --------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `kubectl expose deployment NAME --port=PORT`                                | Create a ClusterIP Service in front of a Deployment           |
| `kubectl expose deployment web-lab --type=NodePort --port=80 --name=web-np` | Create a NodePort Service                                     |
| `kubectl get svc`                                                           | List Services                                                 |
| `kubectl get endpoints NAME`                                                | Pod IPs the Service currently forwards to                     |
| `kubectl port-forward svc/web-np 8080:80`                                   | Forward a local port to a Service or Pod for temporary access |

```yaml
apiVersion: v1
kind: Service
metadata:
  name: shop
spec:
  selector:
    app: shop # pick pods carrying the label app=shop
  ports:
    - port: 80 # the Service listens on 80
      targetPort: 80 # and forwards to port 80 on each pod
```

### Service types

| Type                    | Reachable from                                                       | Use                                                  |
| ----------------------- | -------------------------------------------------------------------- | ---------------------------------------------------- |
| **ClusterIP** (default) | Inside the cluster only                                              | Pod-to-Pod traffic: databases and internal APIs      |
| **NodePort**            | Outside, via a fixed port on **every node**                          | Quick external access                                |
| **LoadBalancer**        | Outside, via a cloud provider's external address                     | A clean public address in the cloud                  |
| **ExternalName**        | Inside. It maps a Service name to an address **outside** the cluster | Give an external resource a friendly in-cluster name |

### Three ports

An external client reaches a NodePort Service on `nodePort` (range 30000–32767). An in-cluster client uses `port`. The Service then forwards to `targetPort` on each selected container.

| Port         | Meaning                                                                                                                                                          |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `targetPort` | Port your **container** listens on (80 for nginx). Defaults to `port` if omitted.                                                                                |
| `port`       | Port the **Service** listens on inside the cluster.                                                                                                              |
| `nodePort`   | Port exposed on **every node** for external traffic. Allowed range **30000–32767**, which keeps it separate from 80 and 443. Omit it and Kubernetes assigns one. |

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web-np
spec:
  type: NodePort
  selector:
    app: web-lab # matches the pod labels of the 'web-lab' Deployment
  ports:
    - port: 80 # port the Service listens on inside the cluster
      targetPort: 80 # port on the pod container
      # nodePort: 30000-32767  # optional; random port in this range if omitted
```

### Which type to use

| Who needs to reach the app?                   | Use                                                               |
| --------------------------------------------- | ----------------------------------------------------------------- |
| Only other Pods                               | ClusterIP (default)                                               |
| You, temporarily, from your machine           | ClusterIP plus `kubectl port-forward`                             |
| Quick external access on a real cluster       | NodePort                                                          |
| A clean public address in the cloud           | LoadBalancer. For HTTP, put one Ingress in front of many Services |
| Pods must reach something outside the cluster | ExternalName                                                      |

`port-forward` is the fastest and safest way to test locally. It exposes the app to nobody else.

## Ingress

- **Ingress** is routing rules written in YAML, such as "send `/shop` to the shop Service." It exists in the cluster but **cannot route traffic by itself**.
- **Ingress Controller** is an application running as Pods (usually NGINX) that reads the Ingress rules and **actually routes traffic**.

An incoming request reaches the Ingress Controller. The controller reads the Ingress object and sends `/app1` to the app1 Service and Pods, and `/app2` to the app2 Service and Pods.

| Object                 | What is it?                                                        | How many?                                |
| ---------------------- | ------------------------------------------------------------------ | ---------------------------------------- |
| **Ingress**            | Routing rules in YAML                                              | One per app or group of apps             |
| **Ingress Controller** | Running proxy software (for example, NGINX) that applies the rules | **Installed once** for the whole cluster |

> **Beginner trap:** an Ingress Controller is **not included** in Kubernetes. An Ingress object on a fresh cluster looks valid, but **no traffic reaches your Pods** until a controller is installed.

### Installing the NGINX Ingress Controller on kind

1. **Label the node.** The kind manifest needs a node labelled `ingress-ready=true`, otherwise the controller Pod stays `Pending`:

```bash
kubectl get nodes
kubectl label node <node-name> ingress-ready=true
```

2. **Apply the manifest.** This creates the `ingress-nginx` namespace, controller Deployment, Service, RBAC, and config:

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
```

3. **Wait until ready.** Image download and startup take a moment:

```bash
kubectl wait --namespace ingress-nginx \
  --for=condition=Ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=180s
```

### Path-based routing

One IP or domain, with different backends chosen by URL path.

**Step 1: two backend apps.** `hashicorp/http-echo` returns the text you give it. Repeat this for `app2`, replacing `app1` with `app2` everywhere:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app1
spec:
  replicas: 1
  selector:
    matchLabels:
      app: app1
  template:
    metadata:
      labels:
        app: app1
    spec:
      containers:
        - name: app1
          image: hashicorp/http-echo:latest
          args: ["-text=app1"]
          ports:
            - containerPort: 5678
---
apiVersion: v1
kind: Service
metadata:
  name: app1
spec:
  selector:
    app: app1
  ports:
    - port: 80
      targetPort: 5678
```

**Step 2: the Ingress rules.**

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: apps
spec:
  ingressClassName: nginx # tells ingress-nginx to manage this Ingress
  rules:
    - http:
        paths:
          - path: /app1
            pathType: Prefix # matches /app1 and sub-paths like /app1/details
            backend:
              service:
                name: app1
                port:
                  number: 80
          - path: /app2
            pathType: Prefix
            backend:
              service:
                name: app2
                port:
                  number: 80
```

`kubectl get ingress` lists Ingress objects. `kubectl describe ingress apps` shows rules, paths, and backends.

### Host-based routing

Traffic is split by **domain name**. The browser sends a `Host` header and the Ingress routes on it. Add a `host:` to each rule:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: sites
spec:
  ingressClassName: nginx
  rules:
    - host: app1.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: app1
                port:
                  number: 80
    - host: app2.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: app2
                port:
                  number: 80
```

**Testing without DNS.** Pass the header manually with `-H` or `--header`:

```bash
curl -H "Host: app1.example.com" http://<CONTROLLER_IP>/
curl -H "Host: app2.example.com" http://<CONTROLLER_IP>/
```

| Routing        | Distinguishes traffic by  | Example                    |
| -------------- | ------------------------- | -------------------------- |
| **Path-based** | URL path after the domain | `http://example.com/app1`  |
| **Host-based** | Host header / domain name | `http://app1.example.com/` |
