---
title: "Linux Commands"
description: "Essential Linux commands for file system management, user administration, text processing, and system monitoring."
order: 2
topic: "linux"
---

## File System Commands

### Disk Usage

```bash
df -h               # disk free — show filesystem usage
df -h /home         # show usage for a specific path
du -sh directory/   # disk usage of a directory (human readable)
du -sh *            # usage of all items in current dir
du -ah | sort -rh | head -20   # top 20 largest files/dirs
```

### File Linking

```bash
ln -s /path/to/original link-name   # create symbolic (soft) link
ln original hard-link               # create hard link
readlink -f symlink                 # resolve symlink to real path
```

### Archiving and Compression

```bash
# tar — tape archive
tar -czf archive.tar.gz directory/     # create compressed archive
tar -xzf archive.tar.gz                # extract compressed archive
tar -tzf archive.tar.gz                # list contents
tar -czf - directory/ | ssh user@host "tar -xzf - -C /dest"  # stream over SSH

# zip / unzip
zip -r archive.zip directory/
unzip archive.zip
unzip archive.zip -d /destination/

# gzip / bzip2
gzip file.txt          # compress (replaces original)
gzip -d file.txt.gz    # decompress
bzip2 file.txt
bunzip2 file.txt.bz2
```

---

## User Management

### User Information

```bash
whoami              # current username
id                  # uid, gid, and group memberships
id alice            # info for specific user
groups              # groups current user belongs to
w                   # who is logged in and what they're doing
who                 # who is logged in
last                # login history
```

### Managing Users (as root/sudo)

```bash
# Create user
useradd -m -s /bin/bash alice          # -m creates home dir, -s sets shell
useradd -m -G sudo,docker alice        # add to groups on creation

# Set/change password
passwd alice

# Modify user
usermod -aG docker alice               # add to group (append)
usermod -s /bin/zsh alice              # change shell
usermod -l newname oldname             # rename user

# Delete user
userdel alice                          # keep home directory
userdel -r alice                       # remove home directory too

# Lock/unlock account
usermod -L alice   # lock
usermod -U alice   # unlock
```

### Managing Groups

```bash
groupadd developers         # create group
groupdel developers         # delete group
gpasswd -a alice developers # add user to group
gpasswd -d alice developers # remove user from group
cat /etc/group              # list all groups
```

### Switch Users and Sudo

```bash
su - alice              # switch to alice (login shell)
sudo command            # run as root
sudo -u alice command   # run as alice
sudo -l                 # list sudo privileges
```

---

## Text Processing

### grep — Search Text

```bash
grep "pattern" file.txt             # basic search
grep -i "pattern" file.txt          # case-insensitive
grep -r "pattern" /var/log/         # recursive search
grep -n "pattern" file.txt          # show line numbers
grep -v "pattern" file.txt          # invert (lines NOT matching)
grep -c "pattern" file.txt          # count matching lines
grep -l "pattern" *.txt             # list files with matches
grep -E "error|warning" file.txt    # extended regex (OR)
grep -A 3 -B 3 "pattern" file.txt   # show 3 lines before and after
```

### awk — Column Processor

```bash
awk '{print $1}' file.txt           # print first column
awk '{print $1, $3}' file.txt       # print columns 1 and 3
awk -F: '{print $1}' /etc/passwd    # use : as delimiter
awk '/pattern/ {print $0}' file     # print lines matching pattern
awk '{sum += $2} END {print sum}' f # sum column 2
awk 'NR > 1 {print}' file.txt       # skip header line
```

### sed — Stream Editor

```bash
sed 's/old/new/' file.txt           # replace first occurrence per line
sed 's/old/new/g' file.txt          # replace all occurrences
sed -i 's/old/new/g' file.txt       # in-place replacement
sed -n '5,10p' file.txt             # print lines 5-10
sed '/pattern/d' file.txt           # delete lines matching pattern
sed -n '/start/,/end/p' file.txt    # print between patterns
```

### sort, uniq, wc

```bash
sort file.txt                  # alphabetical sort
sort -n file.txt               # numeric sort
sort -r file.txt               # reverse sort
sort -k2 file.txt              # sort by column 2
sort -u file.txt               # sort and remove duplicates

uniq file.txt                  # remove consecutive duplicates
uniq -c file.txt               # count occurrences
uniq -d file.txt               # show only duplicates

wc file.txt                    # lines, words, bytes
wc -l file.txt                 # count lines only
wc -w file.txt                 # count words only
```

### cut, tr, paste

```bash
cut -d: -f1 /etc/passwd        # extract field 1 with : delimiter
cut -c1-10 file.txt            # extract characters 1-10

tr 'a-z' 'A-Z' < file.txt     # lowercase to uppercase
tr -d '\n' < file.txt          # delete newlines
tr -s ' ' < file.txt           # squeeze repeated spaces

paste file1.txt file2.txt      # merge lines side by side
```

---

## System Monitoring

### Process Management

```bash
ps aux                          # all running processes
ps aux | grep nginx             # find specific process
pgrep nginx                     # get PID of nginx processes
top                             # interactive process viewer
htop                            # enhanced top (if installed)
kill PID                        # send SIGTERM
kill -9 PID                     # send SIGKILL (force)
killall nginx                   # kill by name
pkill -f "python script.py"     # kill by pattern

# Background jobs
command &                       # run in background
jobs                            # list background jobs
fg %1                           # bring job 1 to foreground
bg %1                           # resume job 1 in background
nohup command &                 # run immune to hangups
```

### System Information

```bash
uname -a                        # kernel info
hostname                        # system hostname
uptime                          # how long system has been running
free -h                         # memory usage
vmstat 1 5                      # virtual memory stats (5 samples, 1s interval)
iostat -x 1                     # I/O statistics

lscpu                           # CPU info
lsmem                           # memory info
lsblk                           # block devices
lspci                           # PCI devices
lsusb                           # USB devices
```

### Network Commands

```bash
ip addr                         # show network interfaces
ip route                        # show routing table
ss -tulnp                       # listening ports (sockets)
netstat -tulnp                  # older equivalent
ping -c 4 google.com            # test connectivity
traceroute google.com           # trace route to host
curl -I https://example.com     # HTTP headers only
wget -q https://example.com     # download file
nslookup example.com            # DNS lookup
dig example.com                 # detailed DNS lookup
```

### Log Files

```bash
journalctl -f                   # follow systemd journal
journalctl -u nginx             # logs for nginx service
journalctl --since "1 hour ago"
tail -f /var/log/syslog         # follow syslog
tail -f /var/log/auth.log       # authentication events
grep "error" /var/log/syslog | tail -50
```
