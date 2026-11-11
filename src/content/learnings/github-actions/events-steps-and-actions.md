---
title: "Events, Steps, and Actions"
description: "Choose what triggers a workflow, write run and uses steps, and understand how actions like checkout work."
order: 2
topic: "github-actions"
---

## Events: When a Workflow Fires

- **`push`** — fires whenever commits are pushed to a branch **on GitHub**. It does not fire on a local commit — only once the push reaches GitHub.
- **`pull_request`** — fires when a PR is opened, and again whenever new commits are pushed to its branch. A push to a branch tied to a PR in the same repo can therefore trigger **both** `push` and `pull_request`.

Multiple triggers:

```yaml
on:
  push:
  pull_request:

# equivalent shorthand
on: [push, pull_request]
```

## Steps: run vs uses

Every step is one of exactly two kinds:

- **run step** — executes a shell command you write yourself.
- **uses step** — executes an **action**, a ready-made piece of packaged work (see the next section).

```yaml
jobs:
  checks:
    runs-on: ubuntu-latest
    steps:
      - name: Say hello
        run: echo "hello from pixelpost"
      - name: Get the code
        uses: actions/checkout@v4
```

### Multi-line run steps and shell

A single command fits on the same line as `run:`. For several commands, add a pipe (`|`) and indent each on its own line:

```yaml
- name: Prepare the report folder
  run: |
    mkdir -p report
    date > report/generated-at.txt
    echo "report folder ready"
```

On a Linux runner, commands run in `bash` by default. `shell:` makes that explicit or switches shells:

```yaml
- name: Run with bash
  shell: bash
  run: echo "running in $0"
```

## Actions

An **action** is a reusable, packaged unit of work that thousands of teams share instead of rewriting the same steps.

```yaml
- name: Get the code
  uses: actions/checkout@v4
```

`owner/repository@ref`:

- **owner** — the GitHub account publishing the action (`actions` belongs to GitHub itself).
- **repository** — the action's repo name.
- **ref** — a tag, branch, or commit SHA after `@` (`v4` is a tag here).

When the job reaches this step, the runner downloads that repo at that ref and executes the code inside it. You write one line; the action's authors wrote and maintain the rest.

Actions can also come from a **local path** in the same repository, or a **Docker image**. Those use different `uses:` address forms — `owner/repository@ref` specifically names a remote repository action.

### actions/checkout in practice

`actions/checkout` clones your repository into the runner's workspace, reading the event that triggered the run so it checks out exactly the commit that was pushed:

```yaml
steps:
  - name: Get the code
    uses: actions/checkout@v4
  - name: Read the readme
    run: cat README.md
```

**Order matters** — checkout must come before any step that reads repository files. That's why almost every real-world workflow has checkout as its first step.
