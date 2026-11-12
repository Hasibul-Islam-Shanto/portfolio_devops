---
title: "Storage"
description: "Keep files beyond a container restart with emptyDir, and beyond a Pod with PersistentVolumeClaims."
order: 8
topic: "kubernetes"
---

## Why volumes exist

Files a container writes go to a temporary layer tied to that container. If the Pod crashes, is deleted, or is updated, that filesystem is **wiped**, and the replacement starts fresh.

Attach an external **Volume** and have the container write there. Storage outside the container survives container replacement.

| Volume type                     | Lifetime                                                           | Best for                                                                    | If the Pod is deleted                      |
| ------------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------- | ------------------------------------------ |
| **`emptyDir`**                  | As long as the Pod                                                 | Scratch space, caches, and sharing files between containers in the same Pod | Data is erased                             |
| **PersistentVolumeClaim (PVC)** | Independent of the Pod (cloud disk, NFS, SAN, and similar storage) | Databases and uploaded files                                                | Data is kept and reattaches to the new Pod |

## emptyDir

An `emptyDir` is a temporary scratch folder created on the node when the Pod starts. It starts **empty**.

- **Use it** as a temporary workspace or cache, or to share files between containers in the same Pod. An app and a logging sidecar can mount the same `emptyDir`.
- A **container restart** keeps the data. **Deleting or evicting the Pod** erases it.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: scratch-pod
spec:
  containers:
    - name: app
      image: busybox
      command: ["sleep", "3600"]
      volumeMounts:
        - name: cache # mount the volume at /data
          mountPath: /data
  volumes:
    - name: cache # create an emptyDir as the source
      emptyDir: {} # {} means default settings
```

## PersistentVolume and PersistentVolumeClaim

Storage is split into two objects, like a locker and a ticket. The Pod mounts a PersistentVolumeClaim. The claim binds to a PersistentVolume, which is the actual storage. A StorageClass can create that volume on demand.

| Object           | Represents                                                        | Analogy          | Lifetime                        |
| ---------------- | ----------------------------------------------------------------- | ---------------- | ------------------------------- |
| **PV**           | The actual disk, share, or folder (AWS EBS, NFS, or a local disk) | The real locker  | Outlives Pods                   |
| **PVC**          | A request such as "I need 100 Mi of storage"                      | A storage ticket | Managed by the developer or Pod |
| **StorageClass** | An automated PV generator                                         | A storage clerk  | Cluster-wide infrastructure     |

Your Pod references the **PVC**, not the PV. That decouples the app from the underlying hardware.

**Dynamic provisioning:** you create a PVC, for example `100Mi`. A StorageClass notices, the cluster creates a matching PV, and the two are linked as **Bound**.

> **Beginner trap:** a PVC stuck in `Pending` is common. On many clusters, including kind, the default StorageClass uses `WaitForFirstConsumer`. The PV is **not** created until a Pod actually uses the PVC, so Kubernetes knows which node to place it on. The PVC stays `Pending` until a Pod attaches, then flips to `Bound`.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: pvc-pod
spec:
  containers:
    - name: app
      image: busybox
      command: ["sleep", "3600"]
      volumeMounts:
        - name: store
          mountPath: /data
  volumes:
    - name: store
      persistentVolumeClaim:
        claimName: data-pvc
```

The `data-pvc` claim itself is a small manifest with `accessModes` and `resources.requests.storage`, the same shape as the `volumeClaimTemplates` entry in a [StatefulSet](/learnings/kubernetes/specialized-workloads).
