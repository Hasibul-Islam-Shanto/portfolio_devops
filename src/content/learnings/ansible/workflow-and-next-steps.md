---
title: "Safe Workflow and Next Steps"
description: "Validate, preview, run, troubleshoot, and improve Ansible automation with a repeatable workflow."
order: 7
topic: "ansible"
---

## A Safe Ansible Workflow

Use small verification steps before applying automation to every server:

```text
Inspect inventory
       │
       ▼
Test connectivity
       │
       ▼
Check syntax
       │
       ▼
Preview changes
       │
       ▼
Run on one host
       │
       ▼
Run on the group
```

## Inspect and Test

```bash
# See inventory groups and hosts
ansible-inventory -i hosts.ini --graph

# Test Ansible connectivity
ansible servers -i hosts.ini -m ansible.builtin.ping
```

These checks catch inventory, SSH, and Python problems before a playbook starts changing a host.

## Validate and Preview

```bash
# Validate YAML and playbook structure
ansible-playbook \
  -i hosts.ini \
  playbooks/nginx_setup.yml \
  --syntax-check

# Preview supported changes and file differences
ansible-playbook \
  -i hosts.ini \
  playbooks/nginx_setup.yml \
  --check \
  --diff
```

Check mode is a preview, not a guarantee. Support varies by module, and arbitrary commands often cannot predict what they would change.

## Start with One Host

Limit the first real run:

```bash
ansible-playbook \
  -i hosts.ini \
  playbooks/nginx_setup.yml \
  --limit worker-node-1
```

After verification, run against the full group:

```bash
ansible-playbook \
  -i hosts.ini \
  playbooks/nginx_setup.yml
```

For troubleshooting, add verbosity:

```bash
ansible-playbook \
  -i hosts.ini \
  playbooks/nginx_setup.yml \
  -vvv
```

Verbose output can include environment details, so review it before sharing logs publicly.

## Improvements Applied to This Lab

The learning project now:

- uses fully qualified module names consistently;
- stores user-configurable role values under `defaults/`;
- marks read-only commands with `changed_when: false`;
- avoids automatic full-system upgrades during configuration runs;
- keeps one authoritative copy of the Nginx template; and
- excludes empty generated role placeholders.

The next practical improvements are handlers for conditional restarts, service assertions, role tests, project-specific role documentation, and automated syntax and lint checks in CI.

## Natural Next Topics

Continue with:

- conditions using `when`;
- tags for selecting parts of a play;
- `group_vars` and `host_vars`;
- Ansible Vault for sensitive values;
- blocks with `rescue` and `always`;
- assertions and role testing;
- collections and dependency files; and
- dynamic inventory for cloud environments.

## Current Learning Outcome

After completing this lab, you should be able to:

- define managed hosts and SSH settings;
- target inventory groups from playbooks;
- use privilege escalation safely;
- manage packages, services, files, and users;
- use variables, lists, loops, facts, and templates;
- register task output and understand change reporting;
- organize automation into Nginx and Docker roles; and
- preview and limit changes before applying them broadly.

> **Key takeaway**
> Reliable automation is not only about making a playbook run. It is also about validating inputs, previewing change, limiting blast radius, checking results, and making repeated runs predictable.
