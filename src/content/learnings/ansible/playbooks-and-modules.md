---
title: "Playbooks and Core Modules"
description: "Learn playbook structure and the Ansible modules used to manage packages, services, files, users, and output."
order: 3
topic: "ansible"
---

## Anatomy of a Playbook

A playbook is a YAML list of plays. Each play selects hosts and contains an ordered list of tasks or roles.

```yaml
- name: Install useful packages
  hosts: servers
  become: true

  tasks:
    - name: Install tree and Python 3
      ansible.builtin.apt:
        name:
          - tree
          - python3
        state: present
        update_cache: true
```

This play:

1. targets the `servers` inventory group;
2. uses `become: true` for operations that require `sudo`;
3. refreshes the APT cache; and
4. ensures both packages are installed.

YAML indentation is significant. Use spaces rather than tabs, and quote file modes such as `'0644'`.

## Command Module

The `command` module runs a command directly without a shell:

```yaml
- name: Print a greeting
  ansible.builtin.command: echo "Hello from Ansible"
  changed_when: false
```

It is safer than `shell` when pipes, redirects, and shell expansion are not needed. Commands are not automatically idempotent, so a read-only command should often use `changed_when: false`.

## APT Module

Use `apt` to manage Debian and Ubuntu packages:

```yaml
- name: Ensure Nginx is installed
  ansible.builtin.apt:
    name: nginx
    state: present
    update_cache: true
```

- `state: present` installs the package if it is missing.
- `state: latest` may upgrade it whenever a newer repository version exists.
- `update_cache: true` refreshes package metadata when needed.

For predictable configuration runs, `present` is usually safer than upgrading every package automatically.

## Service Module

Use `service` to control a system service:

```yaml
- name: Start and enable Nginx
  ansible.builtin.service:
    name: nginx
    state: started
    enabled: true
```

`started` only acts when the service is stopped. In contrast, `restarted` restarts the service on every run.

## Template Module

The lab deploys a custom Nginx page from a Jinja2 template:

```yaml
- name: Deploy the Nginx homepage
  ansible.builtin.template:
    src: index.html.j2
    dest: /var/www/html/index.html
    owner: root
    group: root
    mode: "0644"
```

The source file lives on the control node. Ansible renders it and writes the result to each managed node. The task reports a change only when the content or managed metadata differs.

## User Module

The Docker role adds configured users to the `docker` group:

```yaml
- name: Add users to the Docker group
  ansible.builtin.user:
    name: "{{ item }}"
    groups: docker
    append: true
  loop: "{{ docker_users }}"
```

`append: true` matters because it preserves the user's existing supplementary groups.

## Debug Module

Use `debug` to inspect variables and task results:

```yaml
- name: Show the Docker version
  ansible.builtin.debug:
    msg: "{{ docker_version.stdout }}"
```

Printing a focused field such as `stdout` is clearer than printing the complete registered result.

> **Key takeaway**
> Prefer purpose-built modules over raw commands. Modules understand desired state and usually provide better idempotence, check-mode support, and readable output.
