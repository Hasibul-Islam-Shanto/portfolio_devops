---
title: "File Permissions"
description: "Understanding Linux file permissions, octal notation, chmod/chown commands, and Access Control Lists (ACL)."
order: 3
topic: "linux"
---

## Understanding Permissions

Every file and directory in Linux has three sets of permissions assigned to three categories of users:

```
-rwxr-xr--  1  alice  developers  4096  May 15 10:30  script.sh
│└─┬──┘└┬─┘└┬─┘ └─┬─┘ └───┬────┘ └──┬─┘               └──┬───┘
│  │   │   │    │        │        │                    │
│  │   │   │    │        │        └── size            └── name
│  │   │   │    │        └─ group
│  │   │   │    └── owner
│  │   │   └── other permissions (r--)
│  │   └── group permissions (r-x)
│  └── owner permissions (rwx)
└── file type (- = file, d = directory, l = symlink)
```

### Permission Bits

| Symbol | Name    | On file           | On directory           |
| ------ | ------- | ----------------- | ---------------------- |
| `r`    | read    | read file         | list contents (`ls`)   |
| `w`    | write   | modify file       | create/delete items    |
| `x`    | execute | run as program    | enter directory (`cd`) |
| `-`    | none    | permission denied | permission denied      |

### File Types

| Symbol | Type             |
| ------ | ---------------- |
| `-`    | regular file     |
| `d`    | directory        |
| `l`    | symbolic link    |
| `c`    | character device |
| `b`    | block device     |
| `p`    | named pipe       |
| `s`    | socket           |

---

## Octal Notation

Permissions can be represented as octal (base-8) numbers. Each permission triplet maps to a 3-bit value:

| Binary | Octal | Permissions |
| ------ | ----- | ----------- |
| `000`  | `0`   | `---`       |
| `001`  | `1`   | `--x`       |
| `010`  | `2`   | `-w-`       |
| `011`  | `3`   | `-wx`       |
| `100`  | `4`   | `r--`       |
| `101`  | `5`   | `r-x`       |
| `110`  | `6`   | `rw-`       |
| `111`  | `7`   | `rwx`       |

**Common permission patterns:**

| Octal | Symbolic    | Use case                     |
| ----- | ----------- | ---------------------------- |
| `644` | `rw-r--r--` | Regular files                |
| `600` | `rw-------` | Private files (SSH keys)     |
| `755` | `rwxr-xr-x` | Executables, directories     |
| `700` | `rwx------` | Private executables          |
| `777` | `rwxrwxrwx` | World-writable (avoid!)      |
| `664` | `rw-rw-r--` | Group-writable files         |
| `775` | `rwxrwxr-x` | Group-executable directories |

> **Quick memory trick:** Owner=4+2+1=7, Group=4+0+1=5, Other=4+0+0=4 → `754`

---

## chmod and chown Commands

### chmod — Change Mode

```bash
# Octal notation
chmod 755 script.sh         # rwxr-xr-x
chmod 644 config.txt        # rw-r--r--
chmod 600 ~/.ssh/id_rsa     # rw------- (private key)
chmod -R 755 /var/www/      # recursive

# Symbolic notation: [who][+/-/=][permissions]
chmod u+x script.sh         # add execute for owner
chmod g+w file.txt          # add write for group
chmod o-r secret.txt        # remove read from others
chmod a+r public.txt        # add read for all
chmod u=rwx,g=rx,o= dir/    # set explicitly
chmod +x script.sh          # add execute for all (shorthand)
```

### chown — Change Owner

```bash
chown alice file.txt            # change owner
chown alice:devs file.txt       # change owner and group
chown :devs file.txt            # change group only
chown -R www-data /var/www/     # recursive
chown --reference=ref.txt file  # copy ownership from ref
```

### chgrp — Change Group

```bash
chgrp devs file.txt         # change group
chgrp -R devs /project/     # recursive
```

### Special Permissions

```bash
# SUID (Set User ID) — run as file owner
chmod u+s /usr/bin/passwd   # octal: 4755
# SGID (Set Group ID) — run as group / inherit group on dirs
chmod g+s /shared/          # octal: 2755
# Sticky bit — only owner can delete in directory
chmod +t /tmp               # octal: 1777

# Combined with octal (4=SUID, 2=SGID, 1=sticky)
chmod 4755 program          # SUID + rwxr-xr-x
chmod 2775 shared-dir       # SGID + rwxrwxr-x
chmod 1777 /tmp             # sticky + rwxrwxrwx
```

### umask — Default Permissions

```bash
umask           # show current umask (e.g., 0022)
umask 0027      # set umask for session
# umask subtracts from 666 (files) and 777 (dirs)
# umask 022 → files: 644, dirs: 755
# umask 027 → files: 640, dirs: 750
```

---

## Access Control Lists (ACL)

Standard Unix permissions only allow one owner and one group. ACLs extend this by letting you set permissions for any user or group.

### Checking ACL Support

```bash
# Verify filesystem is mounted with ACL support
mount | grep acl
# or check /etc/fstab for "acl" option
```

### getfacl — View ACL

```bash
getfacl file.txt
# Output:
# file: file.txt
# owner: alice
# group: devs
# user::rw-
# group::r--
# other::r--
```

### setfacl — Set ACL

```bash
# Grant bob read+write on file.txt
setfacl -m u:bob:rw file.txt

# Grant devs group execute on script.sh
setfacl -m g:devs:rx script.sh

# Remove ACL entry for bob
setfacl -x u:bob file.txt

# Remove all ACLs
setfacl -b file.txt

# Recursive (apply to directory and contents)
setfacl -R -m u:bob:rw /project/

# Set default ACL (inherited by new files in directory)
setfacl -d -m u:bob:rw /shared/

# Copy ACL from one file to another
getfacl source.txt | setfacl --set-file=- dest.txt
```

### Practical ACL Example

```bash
# Scenario: web team needs read access to /var/app/config
# but standard group permissions would expose too much

setfacl -m g:webteam:r /var/app/config
setfacl -m u:deploy:rw /var/app/config

# Verify
getfacl /var/app/config
# user::rw-
# user:deploy:rw-
# group::---
# group:webteam:r--
# mask::rw-
# other::---
```

> **Note:** When using ACLs, `ls -l` shows a `+` at the end of the permissions string (e.g., `rw-r--r--+`) to indicate that extended ACLs are set.
