---
title: "Essential Docker Commands"
description: "Build images, run containers, map ports, and clean up — the commands you'll use every day."
order: 3
topic: "docker"
---

## Build an Image

**docker build** reads a Dockerfile and creates an image. The `-t` flag tags it as `name:version`, and the final `.` sets the build context to the current directory.

```bash
# Build and tag an image from the Dockerfile in the current folder
docker build -t my-nginx-app:v1 .
```

Multiple Dockerfiles? Use `-f` to pick a specific file:

```bash
# Build using an alternate Dockerfile in the current directory
docker build -f Dockerfile.single -t my-nginx-app:v1 .
```

| Flag / argument | What it does                            | Example                |
| --------------- | --------------------------------------- | ---------------------- |
| `-t`            | Names the image (name:version)          | `-t my-nginx-app:v1`   |
| `.`             | Build context sent to the Docker daemon | `.` (current folder)   |
| `-f`            | Path to a non-default Dockerfile        | `-f Dockerfile.single` |

## Run a Container

**docker run** starts a container from an image. `-d` runs it in the background, `--name` labels it, and `-p` maps a host port to a container port (`HOST:CONTAINER`).

```bash
# Start nginx in the background, name it, and map host port 8080 to container port 80
docker run -d --name nginx-demo -p 8080:80 my-nginx-app:v1
```

| Flag     | What it does               | Example             |
| -------- | -------------------------- | ------------------- |
| `-d`     | Detached mode — background | `-d`                |
| `--name` | Custom container name      | `--name nginx-demo` |
| `-p`     | Host-to-container port map | `-p 8080:80`        |

## Clean Up

Remove one container or image by name, or wipe everything during a reset:

```bash
# Force-remove a single container by name
docker rm -f containerName

# Force-remove a single image by name and tag
docker rmi -f imageName:v

# Remove every container (running and stopped)
docker rm -f $(docker ps -a -q)

# Remove every image on the system
docker rmi -f $(docker images -a -q)
```

`-f` skips prompts. Bulk commands pass IDs from `docker ps -a -q` (containers) or `docker images -a -q` (images).

## When to Use Which Command

| Goal                        | Command                                   |
| --------------------------- | ----------------------------------------- |
| Dockerfile → reusable image | `docker build -t name:version .`          |
| Run in background           | `docker run -d ...`                       |
| Reach app from browser      | `docker run -p HOST:CONTAINER ...`        |
| Delete one item             | `docker rm -f` or `docker rmi -f`         |
| Full reset                  | Bulk `docker rm` / `docker rmi` with `-q` |

> **Key Takeaway**
> `docker build` creates images from Dockerfiles, `docker run` turns images into live containers, and cleanup commands keep your machine from filling up with stale layers. Build once, run with a port map, and remove what you no longer need.
