---
title: "Ansible Fundamentals and Architecture"
description: "Understand control nodes, managed nodes, inventories, playbooks, modules, and Ansible's agentless model."
order: 1
topic: "ansible"
---

## What Ansible Solves

Configuring one server by hand is manageable. Repeating the same commands across many servers is slower, harder to review, and easy to do inconsistently.

**Ansible** lets us describe the state we want in YAML and apply it to one or many machines. For example:

- required packages are installed;
- Nginx is running and enabled at boot;
- a configuration file has the expected content; and
- selected users belong to the Docker group.

Instead of documenting a list of manual commands, we keep the server configuration as repeatable code.

## The Ansible Mental Model

![Ansible Learning Lab architecture showing a control node configuring two agentless worker nodes](/images/ansible/ansible-learning-lab-architecture.png)

The lab has three important parts:

- **Control node:** the machine where Ansible is installed and commands are run.
- **Managed nodes:** the remote servers Ansible configures.
- **Desired state:** the packages, services, files, and settings those servers should have.

Ansible normally connects through SSH. The managed nodes do not need a permanently running Ansible agent, but they usually need Python so Ansible modules can execute.

```text
Control node
    │
    ├── reads inventory
    ├── reads playbook
    │
    └── connects over SSH
            │
            ├── worker-node-1
            └── worker-node-2
                    │
                    ▼
              Desired state
```

## Inventory, Playbooks, and Modules

Each Ansible layer answers a different question:

| Layer     | Question it answers                                               |
| --------- | ----------------------------------------------------------------- |
| Inventory | Which machines should Ansible manage?                             |
| Playbook  | What automation should run, and on which group?                   |
| Play      | Which hosts, variables, tasks, and roles belong to one operation? |
| Task      | What individual action should Ansible perform?                    |
| Module    | How should Ansible perform that action?                           |
| Role      | How can related tasks and files be packaged for reuse?            |

The flow in this learning lab is:

```text
hosts.ini
    ▼
servers group
    ▼
playbook
    ▼
tasks or roles
    ▼
Ansible modules
    ▼
Configured servers
```

## Declarative Desired State

Ansible works best when a task describes the state that should exist:

```yaml
- name: Ensure Nginx is running
  ansible.builtin.service:
    name: nginx
    state: started
    enabled: true
```

This does not say “start Nginx every time.” It says Nginx must be running and enabled. If that state already exists, Ansible does not need to change it.

> **Key takeaway**
> The inventory identifies the servers, the playbook describes the automation, and modules move each server toward the desired state over an agentless SSH connection.
