---
title: "Namespaces, ConfigMaps, and Secrets"
description: "Separate resources in a cluster, keep configuration out of images, and handle sensitive values carefully."
order: 5
topic: "kubernetes"
---

## Namespaces

A **Namespace** is a virtual fence inside one cluster. It keeps team resources organized, isolated, and free from naming conflicts. On a fresh kind cluster you see four:

| Namespace           | Purpose                                                                                                          |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **default**         | Used when a command specifies no namespace. Everything so far ran here.                                          |
| **kube-system**     | The cluster's own machinery: API server, CoreDNS, and networking. Inspect it, but **do not put your apps here**. |
| **kube-public**     | Readable by everyone; basic public cluster info. Rarely used.                                                    |
| **kube-node-lease** | Bookkeeping to track whether each node is alive. Never modify it directly.                                       |

| Command                                                           | Purpose                                           |
| ----------------------------------------------------------------- | ------------------------------------------------- |
| `kubectl get namespaces` (`ns`)                                   | List all namespaces                               |
| `kubectl get namespace <name>`                                    | Show one namespace                                |
| `kubectl create namespace <name>`                                 | Create a namespace                                |
| `kubectl create deployment <name> --image=<image> -n <namespace>` | Create a Deployment in a namespace                |
| `kubectl apply -f <file> -n <namespace>`                          | Apply a manifest into a namespace                 |
| `kubectl config set-context --current --namespace=<name>`         | Set the default namespace for the current context |
| `kubectl config view --minify -o jsonpath='{..namespace}'`        | Print the current context's namespace             |

## ConfigMaps

A **ConfigMap** is a named collection of configuration data stored in the cluster **separately from any image**. The pairs look like the `KEY=value` settings you passed to Docker with `-e`, but they live in a named Kubernetes object.

| Command                                                        | Purpose                                                           |
| -------------------------------------------------------------- | ----------------------------------------------------------------- |
| `kubectl create configmap <name> --from-literal=<KEY>=<value>` | Create from a literal key and value                               |
| `kubectl create configmap <name> --from-file=<path>`           | Create from a file (file name is the key, contents are the value) |
| `kubectl get configmap`                                        | List ConfigMaps                                                   |
| `kubectl get configmap <name> -o yaml`                         | Print as YAML (you can redirect it to a file)                     |
| `kubectl describe configmap <name>`                            | Readable summary of keys and values                               |

### As environment variables

Use one key, or load every key at once:

```yaml
containers:
  - name: app
    image: busybox
    env:
      - name: APP_MODE
        valueFrom:
          configMapKeyRef:
            name: app-config
            key: APP_MODE
    envFrom:
      - configMapRef:
          name: app-config
```

### Mounted as files

Each key becomes a file in a directory inside the container. The file name is the key and the contents are the value. The app reads it like any other config file. This needs two matching pieces in the Pod spec, the same mechanism used by other volumes:

- a `volume` at Pod level naming the data source (the ConfigMap), and
- a `volumeMount` on the container saying where to mount it.

```yaml
spec:
  volumes:
    - name: config-vol
      configMap:
        name: file-config
  containers:
    - name: app
      image: busybox
      command: ["sh", "-c", "sleep 3600"]
      volumeMounts:
        - name: config-vol
          mountPath: /etc/config
```

## Secrets

| Data                                                | Use           |
| --------------------------------------------------- | ------------- |
| Not sensitive (log level, feature flag, page title) | **ConfigMap** |
| Sensitive (password, API key, token, certificate)   | **Secret**    |

A **Secret** stores key/value pairs a Pod can read, but it is meant for values you would not want displayed or committed to Git. It is handled more carefully than a ConfigMap and signals to the team that the data is sensitive.

| Command                                                             | Purpose                                    |
| ------------------------------------------------------------------- | ------------------------------------------ |
| `kubectl create secret generic <name> --from-literal=<key>=<value>` | Create from literals                       |
| `kubectl get secrets`                                               | List Secrets                               |
| `kubectl describe secret <name>`                                    | Keys and sizes **without** printing values |

```bash
kubectl create secret generic db-secret \
  --from-literal=username=admin \
  --from-literal=password='P@ssw0rd'
```

Use one key from the Secret as an environment variable:

```yaml
env:
  - name: DB_PASSWORD
    valueFrom:
      secretKeyRef:
        name: db-secret
        key: password
```

### Encryption vs base64

| Aspect       | Encryption                          | Base64 encoding                                                 |
| ------------ | ----------------------------------- | --------------------------------------------------------------- |
| What it does | Locks data with a secret key        | Rewrites data in another alphabet so machines handle it cleanly |
| Reversal     | Needs a **private key or password** | **No key.** Anyone can run `base64 -d`                          |
| Security     | Secure                              | **Not secure.** It is essentially plain text                    |

Prove it: `kubectl get secret db-secret -o jsonpath='{.data.password}' | base64 -d`

**What actually keeps Secrets safe:**

1. **RBAC** restricts who may run `kubectl get secret`.
2. **Encryption at rest** configures the cluster to encrypt Secrets on disk in etcd.
3. **Keep them out of Git.** Never commit Secret YAML to shared repositories.

> **Golden rule:** base64 keeps data _tidy_, not _private_. Treat anything base64-encoded as plain text.
