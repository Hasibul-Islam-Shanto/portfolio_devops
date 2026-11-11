---
title: "Job Control: needs, if, and Matrix"
description: "Order jobs with needs, run steps and jobs conditionally with if, and expand one job into many with a matrix."
order: 4
topic: "github-actions"
---

## Job Dependencies (needs)

`needs` on a job lists jobs that must finish successfully before this one starts:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: echo "running tests"
  deploy:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - run: echo "deploying"
```

Two rules:

- **By default, if a needed job fails, the dependent job is skipped.** A job-level condition like `if: ${{ always() }}` explicitly overrides this so the dependent job runs anyway.
- A job can need several: `needs: [test, lint]` waits for both.

## Conditional Execution (if)

Run everything on every push and you'll deploy from experiment branches too. `if` fixes that — it's built from [contexts](/learnings/github-actions/contexts-variables-and-secrets), and the step or job only runs when the expression is true.

### On a step

```yaml
steps:
  - name: Deploy
    if: github.ref == 'refs/heads/main'
    run: echo "deploying"
```

On any other branch, GitHub marks the step **skipped** (shown grey in the log, costs nothing) and the job continues.

Inside `if`, you can usually skip the `${{ }}` wrapper — GitHub treats the whole line as an expression already. An expression starting with `!` needs the wrapper or quoting, so YAML doesn't read it as a tag. Combine with `&&`, `||`, `!`:

```yaml
if: github.ref == 'refs/heads/main' && github.event_name == 'push'
```

### On a job

Same keyword, one level up — a skipped job never even starts a runner:

```yaml
jobs:
  deploy:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - run: echo "deploying"
```

> **Gotcha:** by default, when a job is skipped, jobs that `needs` it are skipped too. A downstream job can override this with `if: ${{ always() }}`.

## Matrix Builds (strategy.matrix)

Copy-pasting a job per Python version (or OS) doesn't scale — someone always forgets to update one copy. The matrix keyword expands one job definition into many.

```yaml
jobs:
  tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ["3.10", "3.11", "3.12"]
    steps:
      - uses: actions/setup-python@v5
        with:
          python-version: ${{ matrix.python-version }}
      - name: Run a version check
        run: python3 -c "import sys; print(sys.version)"
```

GitHub expands this into `tests (3.10)`, `tests (3.11)`, `tests (3.12)` — each on its own fresh runner, in parallel.

- `matrix.python-version` — this job copy's own value from the expansion.
- `actions/setup-python@v5` — a ready-made action that installs the requested Python version.

### exclude — remove combinations

```yaml
strategy:
  matrix:
    python-version: ["3.11", "3.12"]
    os: [ubuntu-latest, macos-latest]
    exclude:
      - python-version: "3.11"
        os: macos-latest
```

The grid expands to 4 combinations; the matching one is removed, so 3 jobs remain.

### include — add combinations

```yaml
strategy:
  matrix:
    python-version: ["3.11", "3.12"]
    include:
      - python-version: "3.13"
```

Bolts extra jobs onto the grid; can also add an extra key to just one existing cell (e.g. an env flag).

### fail-fast

Default is `true`: the moment one matrix job fails, GitHub cancels all still-running siblings — saves minutes but hides information (you only learn 3.10 broke, nothing about 3.11/3.12). Turn it off to let every cell finish:

```yaml
strategy:
  fail-fast: false
  matrix:
    python-version: ["3.10", "3.11", "3.12"]
```
