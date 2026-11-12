---
title: "Basic Linux"
description: "Introduction to Linux — what it is, the directory structure, navigation, and file operations."
order: 1
topic: "linux"
---

## What is Linux

Linux is a free, open-source operating system kernel first released by Linus Torvalds in 1991. Today it powers everything from personal computers and servers to smartphones (Android) and cloud infrastructure.

**Key characteristics:**

- **Open source** — source code is publicly available and freely modifiable
- **Multi-user** — multiple users can use the system simultaneously
- **Multi-tasking** — runs multiple processes concurrently
- **Portable** — runs on many hardware architectures
- **Secure** — fine-grained permission system

Popular Linux distributions include **Ubuntu**, **Debian**, **CentOS/RHEL**, **Fedora**, and **Arch Linux**.

---

## Linux Architecture

Linux is structured as layered components, each building on top of the one below it. This separation keeps the kernel isolated from user-facing software.

```
┌─────────────────────────────────────────────────────────┐
│                      Application                        │
│         browsers · editors · scripts · compilers        │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │                     Shell                       │   │
│   │              bash · zsh · sh · fish             │   │
│   │                                                 │   │
│   │   ┌─────────────────────────────────────────┐   │   │
│   │   │                 Kernel                  │   │   │
│   │   │     memory · CPU · I/O · drivers        │   │   │
│   │   │                                         │   │   │
│   │   │   ┌─────────────────────────────────┐   │   │   │
│   │   │   │            Hardware             │   │   │   │
│   │   │   │    CPU · RAM · Disk · NIC       │   │   │   │
│   │   │   └─────────────────────────────────┘   │   │   │
│   │   └─────────────────────────────────────────┘   │   │
│   └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

| Layer           | Role                                                         |
| --------------- | ------------------------------------------------------------ |
| **Application** | Programs users run directly — everything you interact with   |
| **Shell**       | Translates commands into kernel system calls (bash, zsh)     |
| **Kernel**      | Core OS — manages memory, scheduling, I/O and device drivers |
| **Hardware**    | Physical CPU, RAM, disks, and network interfaces             |

---

## Linux Boot Process

When you press the power button, Linux goes through a fixed sequence before handing control to you.

```
  ┌──────────┐     ┌────────────┐     ┌──────────┐     ┌──────────┐
  │ Power On │────►│ BIOS/UEFI  │────►│  MBR/GPT │────►│   GRUB   │
  │          │     │ POST check │     │ find boot│     │ OS menu  │
  └──────────┘     └────────────┘     └──────────┘     └────┬─────┘
                                                             │
                                                             ▼
  ┌──────────┐     ┌────────────┐     ┌──────────┐     ┌──────────┐
  │  Login   │◄────│  systemd   │◄────│initramfs │◄────│  Kernel  │
  │  prompt  │     │  PID = 1   │     │ temp fs  │     │ into RAM │
  └──────────┘     └────────────┘     └──────────┘     └──────────┘
```

### Boot stages explained

| Stage           | What happens                                                             |
| --------------- | ------------------------------------------------------------------------ |
| **BIOS / UEFI** | Firmware runs POST (Power-On Self Test) to verify hardware               |
| **MBR / GPT**   | First 512 bytes of disk; points to the bootloader location               |
| **GRUB**        | Bootloader presents a menu and loads the selected kernel image           |
| **Kernel**      | Decompresses itself, initialises hardware drivers and mounts `initramfs` |
| **initramfs**   | Minimal temporary filesystem used to mount the real root `(/)`           |
| **systemd**     | PID 1 — starts all system services in parallel based on target units     |
| **Login**       | `getty` presents the login prompt (or display manager for GUI)           |

> **Why does `/boot` matter?** The kernel image (`vmlinuz`), initial ramdisk (`initrd`/`initramfs`), and GRUB config all live in `/boot`. If this partition fills up, the system cannot update or boot a new kernel.

---

## Linux Directory Structure

Linux uses a hierarchical file system rooted at `/` (the root directory). Every file and directory lives under this single tree.

| Directory | Purpose                                        |
| --------- | ---------------------------------------------- |
| `/`       | Root — top of the filesystem hierarchy         |
| `/bin`    | Essential user binaries (`ls`, `cp`, `mv`)     |
| `/sbin`   | System binaries for root (`fdisk`, `ifconfig`) |
| `/etc`    | System configuration files                     |
| `/home`   | User home directories (`/home/alice`)          |
| `/root`   | Home directory for the root user               |
| `/var`    | Variable data — logs, databases, mail spools   |
| `/tmp`    | Temporary files (cleared on reboot)            |
| `/usr`    | User programs and libraries                    |
| `/lib`    | Shared libraries for `/bin` and `/sbin`        |
| `/dev`    | Device files (disks, terminals)                |
| `/proc`   | Virtual filesystem for process/kernel info     |
| `/sys`    | Virtual filesystem for hardware info           |
| `/opt`    | Optional/third-party software                  |
| `/mnt`    | Mount points for temporary filesystems         |
| `/media`  | Mount points for removable media               |
| `/boot`   | Kernel and bootloader files                    |

> **Tip:** Everything in Linux is a file — even hardware devices are represented as files under `/dev`.

---

## Basic Navigation

Navigate the filesystem confidently with these essential commands.

### Print Working Directory

```bash
pwd
# /home/alice
```

### List Directory Contents

```bash
ls              # simple listing
ls -l           # long format (permissions, size, date)
ls -la          # include hidden files (start with .)
ls -lh          # human-readable file sizes
ls -lt          # sort by modification time
ls /etc         # list a specific directory
```

### Change Directory

```bash
cd /etc             # absolute path
cd Documents        # relative path
cd ..               # go up one level
cd ~                # go to home directory
cd -                # go to previous directory
```

### Understanding Paths

- **Absolute path** — starts from root: `/home/alice/docs/report.txt`
- **Relative path** — relative to current directory: `docs/report.txt`
- `.` — current directory
- `..` — parent directory
- `~` — home directory

---

## File Operations

### Creating Files and Directories

```bash
touch filename.txt          # create empty file (or update timestamp)
mkdir my-directory          # create directory
mkdir -p a/b/c              # create nested directories
```

### Copying Files

```bash
cp source.txt dest.txt          # copy file
cp -r source-dir/ dest-dir/     # copy directory recursively
cp -p source.txt dest.txt       # preserve timestamps and permissions
```

### Moving and Renaming

```bash
mv old-name.txt new-name.txt    # rename file
mv file.txt /tmp/               # move file to /tmp
mv dir1/ /opt/dir2              # move and rename directory
```

### Removing Files

```bash
rm file.txt             # remove file
rm -i file.txt          # interactive (prompt before removing)
rm -r directory/        # remove directory and contents
rm -rf directory/       # force remove (no prompts) — USE WITH CAUTION
```

### Viewing File Contents

```bash
cat file.txt            # print entire file
less file.txt           # page through file (q to quit)
head -n 20 file.txt     # show first 20 lines
tail -n 20 file.txt     # show last 20 lines
tail -f /var/log/syslog # follow a file in real time
```

### Finding Files

```bash
find /home -name "*.txt"            # find by name
find / -type f -size +100M          # find files larger than 100MB
find /etc -mtime -7                 # modified in last 7 days
locate filename                     # fast search using index (requires updatedb)
which python3                       # find location of a command
whereis bash                        # find binary, source, and man pages
```
