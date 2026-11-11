---
title: "Reusable Workflows and Composite Actions"
description: "Share whole jobs with workflow_call, share step recipes with composite actions, and know when to use each."
order: 6
topic: "github-actions"
---

## Reusable Workflows (workflow_call)

Write shared steps once, in their own workflow file, and call them like a function from other workflows.

### Making a workflow callable

```yaml
name: checks
on:
  workflow_call:
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: echo "running the shared checks"
```

With only this trigger, the workflow never runs on its own — it waits until another workflow calls it.

### Calling it

The caller replaces a whole job with a `uses:` line:

```yaml
name: pipeline
on: push
jobs:
  checks:
    uses: ./.github/workflows/checks.yml
```

Note what's missing: the calling job has no `runs-on:` and no `steps:` — it hands everything to the called workflow, which brings its own jobs and runners.

`uses:` path forms:

- **Same repository**: `./.github/workflows/checks.yml` — always from the repo root.
- **Another repository**: `owner/repo/.github/workflows/checks.yml@main` — the `@ref` (branch, tag, or commit) is **required** here.

In the run view, jobs from the called workflow appear under the caller's job name joined with a slash, e.g. `checks / test`.

### Inputs

Declare under `workflow_call`:

```yaml
on:
  workflow_call:
    inputs:
      app-name:
        type: string
        required: true
```

Each input has a `type` (string/number/boolean), and can be `required` or carry a `default`. Read it inside via the `inputs` context:

```yaml
steps:
  - run: echo "Checking ${{ inputs.app-name }}"
```

Caller passes values with `with:`, right under `uses:`:

```yaml
jobs:
  checks:
    uses: ./.github/workflows/checks.yml
    with:
      app-name: pixelpost
```

### Secrets don't flow automatically

Repository secrets are **not** visible inside a called workflow by default. The reusable workflow must declare what it expects:

```yaml
on:
  workflow_call:
    secrets:
      NOTIFY_TOKEN:
        required: true
```

And the caller must hand it over:

```yaml
jobs:
  checks:
    uses: ./.github/workflows/checks.yml
    secrets:
      NOTIFY_TOKEN: ${{ secrets.NOTIFY_TOKEN }}
```

Shortcut: `secrets: inherit` passes every secret the caller can see. Convenient within one repo, but naming secrets explicitly documents exactly what the shared workflow touches — generally the better habit.

## Composite Actions

A **composite action** packages a flat recipe of steps you want to reuse _inside_ many jobs — as opposed to a reusable workflow, which packages entire jobs.

`action.yml`:

```yaml
name: build-info
description: Print branch, commit, and Python version
runs:
  using: composite
  steps:
    - run: echo "Branch $GITHUB_REF_NAME"
      shell: bash
    - run: echo "Commit $GITHUB_SHA"
      shell: bash
    - run: python3 --version
      shell: bash
```

Calling it:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/build-info
```

> **Note:** each `run` step inside a composite action needs its own explicit `shell:` key — it isn't inherited the way it is in a normal job.

### Composite action vs reusable workflow

| Aspect           | Composite action                                                                                                 | Reusable workflow                                                                                                                                                                                             |
| ---------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Runner/workspace | Shares the calling job's runner, workspace, and environment — files from earlier steps are immediately available | Starts **separate jobs** with separate workspaces; don't rely on shared files even if a self-hosted runner happens to be the same physical machine — pass data through inputs, outputs, artifacts, or secrets |
| Structure        | Always a flat list of steps                                                                                      | Can contain several jobs, a matrix, `needs:` chains                                                                                                                                                           |
| Secrets          | No secrets section — the calling workflow hands in a needed secret as an input or env var                        | Caller passes declared secrets, or uses `secrets: inherit` where permitted. Environment secrets in the called job and the automatic `GITHUB_TOKEN` follow their own rules                                     |

**Rule of thumb**: if the shared thing needs its own runner or multiple jobs, use a reusable workflow. If it's a recipe of steps to drop inside many jobs, use a composite action. Many teams use both — a reusable workflow for the pipeline's overall shape, composite actions for the small recipes inside it.
