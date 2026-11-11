---
title: "Docker Storage and Volumes"
description: "Persist data beyond container lifetimes — named volumes, bind mounts, and database examples."
order: 7
topic: "docker"
---

## Containers Are Ephemeral

When you remove a container, everything written to its filesystem disappears with it. Imagine running PostgreSQL in Docker, inserting a week's worth of records, then running `docker rm -f my-db`. Without external storage, that data is gone — the database files lived inside the container layer and died when the container did.

**Volumes** solve this by storing data outside the container's writable layer, so it survives restarts, rebuilds, and removals.

## Named Volumes vs Bind Mounts

Both attach external storage to a container, but they work differently:

|             | Named volume                                                        | Bind mount                                                                 |
| ----------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Managed by  | Docker (created with `docker volume create`)                        | You (a path on the host filesystem)                                        |
| Good for    | Database data, app state, anything Docker should manage             | Live code reload during development, config files you edit by hand         |
| Location    | Docker-managed directory (usually under `/var/lib/docker/volumes/`) | Any host path you specify, e.g. `./data:/data`                             |
| Portability | Moves with the volume name across machines via backup/restore       | Tied to a specific host path — breaks if the path does not exist elsewhere |

Re-run a container mapped to the same volume and your previous data comes back exactly as you left it.

## Persisting Database Data

Here is a Compose-style snippet that keeps PostgreSQL data in a named volume:

```yaml
services:
  database:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: myapp
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

Docker creates the `pgdata` volume on first run. PostgreSQL writes to `/var/lib/postgresql/data` inside the container, but the files live in the volume. Stop the container, start a fresh one with the same volume — all tables and rows are still there.

## Why Volumes Matter

- **Data persistence** — your app's state survives container restarts and redeployments instead of resetting every time.
- **Host isolation and performance** — Docker manages volume storage separately from the container layer, avoiding filesystem overhead on the writable layer.
- **Safe data sharing** — multiple containers can mount the same volume read-only or read-write without copying files between containers.
- **Direct Docker management** — use `docker volume ls`, `docker volume inspect`, and `docker volume rm` to manage storage without hunting through host directories.

> **Key Takeaway**
> Container filesystems are temporary — volumes are not. Use named volumes for data Docker should manage (databases, uploads), bind mounts when you need a specific host path (local dev). Map the same volume on every run and your data persists.
