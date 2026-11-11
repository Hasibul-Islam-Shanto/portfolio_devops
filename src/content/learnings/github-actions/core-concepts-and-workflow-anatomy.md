---
title: "Core Concepts and Workflow Anatomy"
description: "Understand events, workflows, jobs, steps, and runners, then read a workflow file from top to bottom."
order: 1
topic: "github-actions"
---

## Core Concepts

![A push event triggers the ci.yml workflow, a runner executes the test job, and the job runs its steps in order](/images/github-actions/event-workflow-runner-steps.jpeg)

- **Event** — something that happens in a repository (a push, an opened pull request, a scheduled trigger). Events define _when_ a workflow runs.
- **Workflow** — a YAML file that specifies what to do when an event occurs. A repository can contain multiple workflows.
- **Job** — a group of steps that runs on a single machine. A workflow can contain multiple jobs, which run **concurrently by default**.
- **Step** — an individual action within a job (running tests, installing Python, downloading code). Steps run **sequentially**.
- **Runner** — the machine that executes a job. GitHub-hosted runners spin up a fresh VM per job. Usage limits and billing depend on the repository and plan.

### Where things live

| Aspect           | Repository side                                                                                                                                                                                                          | GitHub side                                                                                                                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| What             | Workflow files live in the fixed root-level folder `.github/workflows/`. The repo can also hold local actions, action metadata, scripts, Dockerfiles, and other files those workflows use — all regular, versioned code. | GitHub watches the repo for events. When one fires, GitHub reads the workflow file, creates the jobs, finds an eligible runner, and starts the run.                                            |
| Runner lifecycle | —                                                                                                                                                                                                                        | A **GitHub-hosted runner** is a fresh VM provisioned for a single job and discarded afterward. A **self-hosted runner** is installed and maintained by its owner and can persist between jobs. |

## Anatomy of a Workflow File

```yaml
name: pixelpost CI
on: push
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Say hello
        run: echo "hello from CI"
```

Read top to bottom:

- `name` — display name shown in GitHub's UI next to each run. Optional, but best practice to set it.
- `on` — the event that triggers the workflow ("the when"). Here, any push.
- `jobs` — a map of jobs. Each key (e.g. `test`) is a job ID you define. A standard job needs `runs-on` (the runner) and `steps` (a list). A job that calls a reusable workflow uses a job-level `uses` key instead.
- **Steps** are a YAML list, each beginning with `-`. A step that runs a shell command uses `run:`; `name:` labels it in the logs.

### What a run looks like

![A push event starts the ci.yml workflow; the test job gets the code, installs dependencies, and runs tests on one runner, ending in a green tick if every step passes or a red cross if one fails](/images/github-actions/ci-workflow-run-flow.png)

All steps of a job run on the same runner. If every step passes, the commit gets a green tick; if any step fails, it gets a red cross.
