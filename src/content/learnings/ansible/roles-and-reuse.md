---
title: "Reusable Automation with Roles"
description: "Organize Nginx and Docker automation into roles with tasks, templates, handlers, defaults, and metadata."
order: 6
topic: "ansible"
---

## Why Roles Matter

A long playbook is useful while learning, but it becomes difficult to reuse and maintain. An Ansible role packages one responsibility—such as configuring Nginx or Docker—into a predictable directory structure.

The lab replaces a full Nginx setup playbook with a small role caller:

```yaml
- name: Install Nginx with a role
  hosts: servers
  become: true

  roles:
    - nginx
```

The playbook chooses **where** the automation runs. The role contains **how** Nginx is configured.

## Standard Role Structure

```text
roles/nginx/
├── tasks/
│   └── main.yml
├── handlers/
│   └── main.yml
├── defaults/
│   └── main.yml
├── vars/
│   └── main.yml
├── templates/
│   └── index.html.j2
├── meta/
│   └── main.yml
├── tests/
└── README.md
```

Ansible automatically looks for `main.yml` in these standard directories.

| Directory    | Responsibility                                    |
| ------------ | ------------------------------------------------- |
| `tasks/`     | Main work performed by the role                   |
| `handlers/`  | Event-driven tasks notified by changes            |
| `defaults/`  | Low-precedence values callers can easily override |
| `vars/`      | Higher-precedence internal role variables         |
| `templates/` | Jinja2 templates rendered by the role             |
| `meta/`      | Role metadata and dependencies                    |
| `tests/`     | Test inventory and verification scaffolding       |

## Nginx Role

The lab's Nginx role has three responsibilities:

```yaml
- name: Install Nginx
  ansible.builtin.apt:
    name: nginx
    state: present
    update_cache: true

- name: Start and enable Nginx
  ansible.builtin.service:
    name: nginx
    state: started
    enabled: true

- name: Deploy the custom homepage
  ansible.builtin.template:
    src: index.html.j2
    dest: /var/www/html/index.html
    owner: root
    group: root
    mode: "0644"
```

Because the template is inside the role's `templates/` directory, `src: index.html.j2` is enough. The calling playbook does not need to know its full path.

## Docker Role

The Docker role demonstrates:

- package installation;
- service management;
- adding multiple users to the Docker group;
- registering command output; and
- printing useful verification data.

A reusable user setting belongs in role defaults:

```yaml
# roles/docker/defaults/main.yml
docker_users:
  - ubuntu
```

Then another playbook or inventory can override it:

```yaml
docker_users:
  - deploy
  - ci-runner
```

Values under `vars/` have higher precedence and are harder for callers to replace, so they are better for values intended to stay internal.

## Improving a Generated Role

`ansible-galaxy init` can generate a role skeleton, but generated placeholders are not finished documentation or tests. A reusable role should add:

1. supported operating systems and versions;
2. documented input variables and defaults;
3. handlers for conditional restarts;
4. meaningful metadata and dependencies;
5. assertions that verify the resulting service; and
6. examples showing how to call the role.

> **Key takeaway**
> Keep playbooks small and intention-focused. Put reusable implementation details in roles, expose configurable values through defaults, and document the contract each role provides.
