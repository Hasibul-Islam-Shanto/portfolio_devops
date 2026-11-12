---
title: "Runners and Quick Glossary"
description: "Compare GitHub-hosted and self-hosted runners, secure self-hosted machines, and review the key keywords."
order: 7
topic: "github-actions"
---

## Runners

| Aspect      | GitHub-hosted                                      | Self-hosted                                                                      |
| ----------- | -------------------------------------------------- | -------------------------------------------------------------------------------- |
| Lifecycle   | Fresh VM per job, destroyed after the job finishes | Your own machine; persists after the job and can retain files/state between runs |
| Maintenance | Managed by GitHub                                  | Installed and maintained by you                                                  |
| Billing     | Usage-based, per plan                              | Your own infrastructure cost                                                     |

### Self-hosted runner security

- **Never attach a self-hosted runner to a public repository.** Anyone can open a pull request against a public repo, and PR-triggered workflows can run attacker-controlled code on that runner — on a self-hosted machine that means arbitrary code execution on infrastructure you own, with access to whatever that runner can reach (internal network, secrets, credentials).
- Prefer **ephemeral runners** (spun up fresh per job, destroyed after) over long-lived ones, so a compromised job can't leave something behind for the next run.
- **Isolate runners per trust level** — don't let the same self-hosted runner (or pool) serve both a low-trust/public-facing repo and one with sensitive secrets or network access.
- **Limit network reach and scope of secrets** available to the runner to only what the workflows actually need (principle of least privilege).
- **Restrict who can register/modify runners and workflow files** at the org/repo level, since a workflow file is effectively code that will execute on that runner.
- Monitor and audit run logs and runner activity periodically, and keep the runner's own OS/software patched like any other production machine.

## Quick Glossary

| Keyword                                         | Purpose                                                                          |
| ----------------------------------------------- | -------------------------------------------------------------------------------- |
| `on`                                            | Event(s) that trigger the workflow                                               |
| `jobs`                                          | Map of jobs, each with `runs-on` and `steps` (or `uses` for a reusable workflow) |
| `runs-on`                                       | Which runner a job uses                                                          |
| `run` / `uses`                                  | Shell command vs. packaged action                                                |
| `needs`                                         | Job ordering / dependency                                                        |
| `if`                                            | Conditional execution (step or job level)                                        |
| `strategy.matrix`                               | Expand one job definition into many parameter combinations                       |
| `vars` / `secrets`                              | Repo-level plain values vs. encrypted values                                     |
| `actions/upload-artifact` / `download-artifact` | Pass files between jobs in a run                                                 |
| `actions/cache`                                 | Persist a folder across separate runs                                            |
| `workflow_call`                                 | Make a workflow callable by other workflows (reusable workflow)                  |
| Composite action                                | Reusable flat step recipe, shares caller's runner/workspace                      |
