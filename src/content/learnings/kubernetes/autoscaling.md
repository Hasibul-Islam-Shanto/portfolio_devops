---
title: "Autoscaling"
description: "Install Metrics Server on kind, then let an HPA add and remove Pods from live CPU usage."
order: 10
topic: "kubernetes"
---

## Metrics Server

**Metrics Server** aggregates CPU and memory usage from each node's kubelet and exposes it through the Kubernetes API, so `kubectl top` and the **Horizontal Pod Autoscaler** can make scaling decisions.

**Step 1: install.** This creates the Deployment, ServiceAccount, RBAC, and Service in `kube-system`:

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

**Step 2: patch for kind.** Local kind nodes use self-signed certificates, so Metrics Server cannot scrape kubelets. Append `--kubelet-insecure-tls`:

```bash
kubectl -n kube-system patch deployment metrics-server --type=json \
  -p '[{"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-insecure-tls"}]'
```

> **Production warning:** skipping TLS verification is for local labs only. In production, use properly signed and verified node certificates.

**Step 3: verify.** The Pod rolls out again. Wait 30–60 seconds for the first collection cycle.

```bash
kubectl get deployment metrics-server -n kube-system   # expect READY 1/1
kubectl top nodes
kubectl top pods -A
```

| Command                                     | Purpose                                      |
| ------------------------------------------- | -------------------------------------------- |
| `kubectl apply -f <URL>`                    | Install resources from a URL                 |
| `kubectl patch deployment ...`              | Modify a running Deployment in place         |
| `kubectl top nodes` / `kubectl top pods -A` | Live CPU (millicores) and memory (MiB) usage |

## Horizontal Pod Autoscaler

An **HPA** automatically adds or removes Pod replicas of a Deployment based on live CPU or memory utilization.

- **Horizontal scaling** means more or fewer Pods.
- **Vertical scaling** means making an existing Pod bigger with more CPU or memory.

Metrics Server collects CPU and memory from kubelets. The HPA compares that usage with the target. Above the target, it scales toward max. On target, it makes no change. Below the target, it scales toward min. Both directions change the Deployment's replica count.

| Average CPU (target 50%) | Action                             |
| ------------------------ | ---------------------------------- |
| 90%                      | Scale **up** toward max replicas   |
| 50%                      | Hold steady                        |
| 20%                      | Scale **down** toward min replicas |

`min` and `max` are guardrails. There is no scaling to zero in quiet hours, and no endless scaling during a spike.

> **Requirement: CPU requests.** The percentage is calculated **relative to the Pod's CPU request**. A request of `200m` while the Pod uses `100m` is 50%. Without `resources.requests.cpu`, the HPA shows `<unknown>` and **will not scale**. Requests and limits are covered in [resources and scheduling](/learnings/kubernetes/resources-and-scheduling).

```bash
kubectl autoscale deployment web-auto --cpu-percent=50 --min=1 --max=5
kubectl get hpa
kubectl describe hpa web-auto
```

`kubectl get hpa` shows current usage against the target and the replica count. `kubectl describe hpa web-auto` shows events and missing metrics or requests.

The declarative equivalent:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web-auto
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web-auto
  minReplicas: 1
  maxReplicas: 5
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 50
```
