---
title: "Contexts, Variables, and Secrets"
description: "Read run information with expressions, and store configuration and credentials outside the workflow file."
order: 3
topic: "github-actions"
---

## Contexts and Expressions

A **context** is a bundle of named values available as a run and its jobs progress — branch, commit, event, machine info, job status, etc. Your workflow asks for a value, and GitHub evaluates the expression at that point in the file.

### Expression syntax

Wrap a context lookup in `${{ }}`:

```yaml
steps:
  - name: Show the branch
    run: echo "This run was triggered on ${{ github.ref }}"
```

GitHub replaces `${{ github.ref }}` with the real value before the shell ever runs — by the time `echo` executes, only the value remains.

### Main contexts to know

- `github` — facts about the run and repository: branch, commit, event, who pushed.
- `runner` — facts about the executing machine, e.g. its OS.
- `job` — the status of the current job while it runs.
- `matrix` — this job's values when using a [matrix strategy](/learnings/github-actions/job-control-needs-if-and-matrix).
- `inputs` — values passed into a [reusable workflow](/learnings/github-actions/reusable-workflows-and-composite-actions).

Access syntax: property style `context.field` (e.g. `github.sha`, `runner.os`) or index style `github['sha']`. Functions can take a whole context object, e.g. `toJSON(github)`.

## Variables vs Secrets

`env:` blocks live inside the workflow file — change one and you must edit and push a commit. Two alternatives store values **outside** the file, on the repository itself.

### Repository variables (vars)

Plain values every workflow in the repo can read; edit them without touching code:

```yaml
steps:
  - name: Show the target region
    run: echo "Deploying to ${{ vars.DEPLOY_REGION }}"
```

### Repository secrets (secrets)

Look like variables but behave very differently:

- Encrypted the moment they're saved.
- **Never shown again** — not in settings, not via the API. You can replace or delete one, never read it back.
- Only a _running workflow_ receives the decrypted value.

Safe pattern — hand the value to a step as an env var, never inline it in `run:`:

```yaml
steps:
  - name: Call the API
    env:
      APP_TOKEN: ${{ secrets.APP_TOKEN }}
    run: |
      if [ -n "$APP_TOKEN" ]; then
        echo "token is available to this step"
      fi
```

The shell sees `$APP_TOKEN` like any env var, but the value never appears in the workflow file itself.
