---
title: "Idempotence, Registered Results, and Handlers"
description: "Make repeated runs predictable, inspect task output, and restart services only when configuration changes."
order: 5
topic: "ansible"
---

## What Idempotence Means

An idempotent task can run repeatedly and reach the same desired state without making an unnecessary change every time.

Examples:

- `apt` with `state: present` changes a host only when a package is missing.
- `service` with `state: started` changes a host only when the service is stopped.
- `template` changes a file only when its content or metadata differs.
- `user` changes group membership only when required.

A second playbook run should ideally report mostly `ok`, not `changed`.

```text
First run:   changed=4
Second run:  changed=0
```

## Commands Need Extra Care

Ansible cannot always determine whether an arbitrary command changes the machine:

```yaml
- name: Read the Docker version
  ansible.builtin.command: docker --version
  register: docker_version
  changed_when: false
```

The command is read-only, so `changed_when: false` keeps the play recap accurate.

For a command that creates something, use conditions such as `creates` or `removes` when appropriate:

```yaml
- name: Initialize application data
  ansible.builtin.command: /opt/app/bin/initialize
  args:
    creates: /opt/app/.initialized
```

## Registering Task Results

`register` stores a task's complete result in a variable:

```yaml
- name: Read the Docker version
  ansible.builtin.command: docker --version
  register: docker_version
  changed_when: false

- name: Show the Docker version
  ansible.builtin.debug:
    msg: "{{ docker_version.stdout }}"
```

A command result commonly contains:

| Field     | Meaning                          |
| --------- | -------------------------------- |
| `stdout`  | Standard output                  |
| `stderr`  | Error output                     |
| `rc`      | Process return code              |
| `changed` | Whether Ansible reports a change |
| `failed`  | Whether the task failed          |

Registered values are host-specific. Each managed host stores its own result.

## Restart Only When Needed

Using `state: restarted` in a normal task restarts a service on every run. A handler makes the restart event-driven:

```yaml
tasks:
  - name: Deploy Nginx configuration
    ansible.builtin.template:
      src: nginx.conf.j2
      dest: /etc/nginx/nginx.conf
      owner: root
      group: root
      mode: "0644"
    notify: Restart Nginx

handlers:
  - name: Restart Nginx
    ansible.builtin.service:
      name: nginx
      state: restarted
```

The handler runs only if the template task reports a change. If several tasks notify the same handler, it normally runs once at the end of the play.

## Operations That May Surprise You

These patterns can make repeated runs less predictable:

```yaml
# Upgrades whenever newer packages are available
state: latest

# Restarts on every run
state: restarted

# Runs without built-in desired-state knowledge
ansible.builtin.command: some-command
```

They are not always wrong, but their behavior should be intentional. Package upgrades are often better handled through a controlled maintenance policy than hidden inside every configuration run.

> **Key takeaway**
> Accurate change reporting builds trust in automation. Use declarative modules, mark read-only commands correctly, and connect configuration changes to service restarts through handlers.
