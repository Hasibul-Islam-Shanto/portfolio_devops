---
title: "Scenario Based Questions"
description: "Real-world Linux interview and scenario questions covering services, commands, ACL, file searching, and text processing."
order: 4
topic: "linux"
---

## System & Service Management

### Q: A service fails to start after a reboot. How do you investigate?

```bash
# Check the service status
systemctl status nginx.service

# View recent logs
journalctl -u nginx.service -n 50

# Check for dependency issues
systemctl list-dependencies nginx.service

# Try starting manually to see output
systemctl start nginx.service
journalctl -xe  # show recent journal with explanations

# Check if port is already in use
ss -tulnp | grep :80
lsof -i :80
```

**Investigation checklist:**

1. Is the service enabled? (`systemctl is-enabled nginx`)
2. Are config files valid? (`nginx -t`)
3. Are required ports free?
4. Are file permissions correct on config/log directories?

---

### Q: System is running slowly. How do you diagnose it?

```bash
# 1. Check overall load
uptime
# load average: 0.90, 2.5, 3.1
# (1min, 5min, 15min) — high if > number of CPU cores

# 2. Find CPU-heavy processes
top         # press P to sort by CPU
ps aux --sort=-%cpu | head -10

# 3. Check memory
free -h
vmstat 1 5

# 4. I/O wait
iostat -x 1 5
iotop       # (if installed) — per-process I/O

# 5. Check disk space
df -h
du -sh /var/log/* | sort -rh | head -10

# 6. Network issues?
ss -s
netstat -s | grep -E "retransmit|failed"
```

---

### Q: How do you add a service to start on boot?

```bash
# systemd (modern)
systemctl enable nginx           # enable on boot
systemctl enable --now nginx     # enable and start immediately
systemctl disable nginx          # remove from boot

# Verify
systemctl is-enabled nginx
# enabled / disabled / static

# SysV init (older)
update-rc.d nginx defaults       # Debian/Ubuntu
chkconfig nginx on               # RHEL/CentOS
```

---

### Q: How do you check which process is using a file that you can't delete?

```bash
# Find what process has the file open
lsof /path/to/file
fuser /path/to/file          # simpler output, just PIDs
fuser -v /path/to/file       # verbose, shows process names

# If file is already deleted but still open (disk not freed)
lsof | grep deleted
# The disk space won't be freed until the process closes the fd

# Force close: kill the process using it
fuser -k /path/to/file
```

---

## Linux Commands

### Q: How do you find and replace text across multiple files?

```bash
# Using grep + sed
grep -rl "old_text" /path/          # list files containing text
sed -i 's/old_text/new_text/g' $(grep -rl "old_text" /path/)

# Better: using find + sed
find /path/ -name "*.conf" -exec sed -i 's/old/new/g' {} \;

# Using awk for complex replacements
awk '{ gsub(/old/, "new"); print }' input > output && mv output input
```

---

### Q: System disk is full. How do you free space?

```bash
# 1. Find largest directories
du -sh /* 2>/dev/null | sort -rh | head -20
du -sh /var/* | sort -rh | head -10

# 2. Clean package cache
apt clean           # Debian/Ubuntu
yum clean all       # RHEL/CentOS

# 3. Remove old log files
find /var/log -name "*.gz" -mtime +30 -delete
journalctl --vacuum-time=7d     # keep only 7 days of logs
journalctl --vacuum-size=500M   # or keep only 500MB

# 4. Find large files
find / -type f -size +500M 2>/dev/null

# 5. Remove old kernels (Ubuntu)
apt autoremove

# 6. Check /tmp
du -sh /tmp && ls -la /tmp
```

---

### Q: How do you schedule a recurring task?

```bash
# Edit crontab
crontab -e

# Crontab format: minute hour day month weekday command
# ┌─── minute (0-59)
# │ ┌─── hour (0-23)
# │ │ ┌─── day of month (1-31)
# │ │ │ ┌─── month (1-12)
# │ │ │ │ ┌─── weekday (0-7, 0 and 7 = Sunday)
# │ │ │ │ │
  0 2 * * * /opt/backup.sh            # daily at 2am
  */5 * * * * /opt/health-check.sh    # every 5 minutes
  0 0 1 * * /opt/monthly-report.sh    # 1st of each month

# View current crontab
crontab -l
# View another user's crontab
crontab -u alice -l

# System-wide cron
ls /etc/cron.{hourly,daily,weekly,monthly}/
```

---

## ACL Scenarios

### Q: Multiple teams need different access to a shared directory. How do you configure this?

```bash
# Scenario: /var/projects shared directory
# - devteam: read + write + execute
# - qa team: read + execute only
# - intern alice: read only
# - No access for others

chmod 770 /var/projects
setfacl -m g:devteam:rwx /var/projects
setfacl -m g:qa:r-x /var/projects
setfacl -m u:alice:r-- /var/projects
chmod o-rwx /var/projects

# Set defaults so new files inherit ACL
setfacl -d -m g:devteam:rwx /var/projects
setfacl -d -m g:qa:r-x /var/projects

# Verify
getfacl /var/projects
```

---

### Q: How do you back up and restore ACLs?

```bash
# Backup ACLs recursively
getfacl -R /var/projects > /backup/projects-acl-backup.txt

# Restore ACLs
setfacl --restore=/backup/projects-acl-backup.txt
```

---

## File Searching

### Q: Find all files modified in the last 24 hours owned by root

```bash
find / -user root -mtime -1 -type f 2>/dev/null
# -mtime -1 : modified less than 1 day ago
# -mtime +7 : modified more than 7 days ago
# -mtime  7 : modified exactly 7 days ago
```

### Q: Find files larger than 100MB but exclude /proc and /sys

```bash
find / -path /proc -prune -o -path /sys -prune -o \
  -type f -size +100M -print 2>/dev/null
```

### Q: Find all SUID/SGID files on the system

```bash
# SUID files (potential security risk)
find / -perm -4000 -type f 2>/dev/null

# SGID files
find / -perm -2000 -type f 2>/dev/null

# Both SUID and SGID
find / -perm /6000 -type f 2>/dev/null
```

---

## Text Processing

### Q: Extract unique IP addresses from an access log

```bash
# access.log format: IP - - [date] "request" status size
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head -20
```

### Q: Count HTTP status codes from a web server log

```bash
awk '{print $9}' /var/log/nginx/access.log | sort | uniq -c | sort -rn
# Output:
# 25421 200
#  3201 304
#   812 404
#    44 500
```

### Q: Find lines in file A that are not in file B

```bash
# Method 1: comm (files must be sorted)
sort file_a.txt > sorted_a.txt
sort file_b.txt > sorted_b.txt
comm -23 sorted_a.txt sorted_b.txt

# Method 2: grep
grep -vxFf file_b.txt file_a.txt
```

### Q: Extract the 5th column from a CSV, remove header, sum values

```bash
tail -n +2 data.csv | cut -d, -f5 | awk '{sum += $1} END {print sum}'
```

### Q: Replace the nth occurrence of a pattern in a file

```bash
# Replace only the 2nd occurrence of "error"
sed 's/error/WARNING/2' file.txt

# Replace occurrences 2 and beyond
sed 's/error/WARNING/2g' file.txt
```
