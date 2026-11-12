---
title: "Environment Variables in Docker"
description: "Pass config into containers at runtime — dev vs production settings without changing code."
order: 4
topic: "docker"
---

## Why Environment Variables Matter

Apps need different settings in different environments — a database URL in development, another in production, a port number, a log level. **Environment variables** let you inject that config at runtime instead of hardcoding values into your source code. Change the variable, redeploy the container, and the app picks up the new setting without a rebuild.

## Set Variables at Run Time with `-e`

The `-e` flag on **docker run** passes a variable into a running container. This is the quickest way to override defaults when starting an app:

```bash
# Start a Node app with environment-specific config
docker run -d --name my-api \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -p 3000:3000 \
  my-node-app:v1
```

Inside the container, your app reads `process.env.NODE_ENV` and `process.env.PORT` just like it would on a bare machine. Swap `production` for `development` locally — same image, different config.

## Set Defaults in the Dockerfile with `ENV`

Use **ENV** in a Dockerfile to bake in sensible defaults that `docker run -e` can still override:

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY . .

# Default config — override at run time with -e if needed
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000
CMD ["node", "server.js"]
```

Think of Dockerfile `ENV` as the default and `docker run -e` as the override. Production might pass `-e NODE_ENV=production`; your laptop might pass `-e NODE_ENV=development` using the exact same image.

## Do Not Hardcode Secrets

Never put passwords, API keys, or tokens directly in a Dockerfile or image layer. Anyone who pulls the image can inspect its layers and read those values — `docker history` and image scanning tools expose them easily. Pass secrets at run time via `-e`, a secrets manager, or Docker Compose secrets instead of baking them into the build.

> **Key Takeaway**
> Environment variables keep config out of your code. Set defaults with `ENV` in the Dockerfile, override per environment with `-e` at run time, and never embed secrets in an image — treat them as runtime input, not build-time constants.
