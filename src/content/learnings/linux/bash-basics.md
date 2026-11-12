---
title: "Bash Script Basics"
description: "Learn Bash scripting fundamentals: shebang, variables, conditionals, loops, and functions."
order: 5
topic: "linux"
---

## Shebang

Every Bash script starts with a **shebang** (`#!`) on the first line. It tells the OS which interpreter to use.

```bash
#!/usr/bin/env bash
# Preferred — finds bash in PATH, more portable

#!/bin/bash
# Also common — uses bash at fixed location
```

### Making a Script Executable

```bash
# Write script
cat > hello.sh << 'EOF'
#!/usr/bin/env bash
echo "Hello, World!"
EOF

# Make executable
chmod +x hello.sh

# Run it
./hello.sh
bash hello.sh    # alternative — don't need +x
```

### Script Best Practices (Header)

```bash
#!/usr/bin/env bash
set -euo pipefail
# -e : exit on error
# -u : treat unset variables as errors
# -o pipefail : catch errors in pipelines
```

---

## Variables

### Declaring and Using Variables

```bash
# Assignment — NO spaces around =
name="Alice"
age=30
greeting="Hello, $name!"

# Using variables
echo $name          # simple
echo "${name}"      # safer, preferred (explicit boundary)
echo "User: ${name}, Age: ${age}"
```

### Variable Types

```bash
# String
message="DevOps is awesome"

# Integer (use for math)
count=10
(( count++ ))       # increment
(( count += 5 ))    # add 5
echo $count         # 16

# Read-only (constant)
readonly MAX_RETRIES=5
declare -r PI=3.14  # same as readonly

# Arrays
fruits=("apple" "banana" "cherry")
echo ${fruits[0]}       # apple
echo ${fruits[@]}       # all elements
echo ${#fruits[@]}      # array length
fruits+=("mango")       # append

# Associative arrays (bash 4+)
declare -A config
config["host"]="localhost"
config["port"]="5432"
echo ${config["host"]}
```

### Special Variables

```bash
$0      # script name
$1, $2  # positional arguments (first, second...)
$@      # all arguments as separate words
$*      # all arguments as single string
$#      # number of arguments
$?      # exit status of last command (0 = success)
$$      # PID of current script
$!      # PID of last background command
$_      # last argument of previous command
```

### Command Substitution

```bash
current_date=$(date +%Y-%m-%d)
echo "Today is: $current_date"

files_count=$(ls | wc -l)
echo "Files in directory: $files_count"

# Nested
echo "Disk usage: $(df -h / | tail -1 | awk '{print $5}')"
```

### String Operations

```bash
text="Hello, World!"

echo ${#text}           # length: 13
echo ${text:0:5}        # substring: Hello
echo ${text^^}          # uppercase: HELLO, WORLD!
echo ${text,,}          # lowercase: hello, world!
echo ${text/World/Bash} # replace: Hello, Bash!

# Default values
name=${1:-"Guest"}              # use "Guest" if $1 is unset
port=${PORT:-8080}              # use 8080 if $PORT unset
config=${CONFIG:?"CONFIG must be set"} # error if unset
```

---

## Conditionals

### if / elif / else

```bash
#!/usr/bin/env bash
score=85

if [ $score -ge 90 ]; then
    echo "Grade: A"
elif [ $score -ge 80 ]; then
    echo "Grade: B"
elif [ $score -ge 70 ]; then
    echo "Grade: C"
else
    echo "Grade: F"
fi
```

### Test Conditions

```bash
# Numeric comparisons
[ $a -eq $b ]   # equal
[ $a -ne $b ]   # not equal
[ $a -lt $b ]   # less than
[ $a -le $b ]   # less than or equal
[ $a -gt $b ]   # greater than
[ $a -ge $b ]   # greater than or equal

# String comparisons
[ "$a" = "$b" ]     # equal
[ "$a" != "$b" ]    # not equal
[ -z "$a" ]         # empty string
[ -n "$a" ]         # non-empty string

# File tests
[ -f "$file" ]  # is regular file
[ -d "$dir" ]   # is directory
[ -e "$path" ]  # exists
[ -r "$file" ]  # readable
[ -w "$file" ]  # writable
[ -x "$file" ]  # executable
[ -s "$file" ]  # file size > 0

# Logical operators
[ "$a" = "yes" ] && [ $b -gt 0 ]   # AND
[ "$a" = "yes" ] || [ "$b" = "y" ] # OR
! [ -f "$file" ]                    # NOT
```

### Double Brackets (bash extended)

```bash
# [[ ]] is preferred in bash — more powerful
if [[ $name == "Alice" ]]; then
    echo "Hello, Alice!"
fi

# Pattern matching
if [[ $filename == *.log ]]; then
    echo "It's a log file"
fi

# Regex matching
if [[ $email =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
    echo "Valid email"
fi

# No need to quote variables in [[ ]]
if [[ -f $file && -r $file ]]; then
    echo "File exists and is readable"
fi
```

### case Statement

```bash
#!/usr/bin/env bash
day=$(date +%A)

case $day in
    Monday|Tuesday|Wednesday|Thursday|Friday)
        echo "Weekday — time to work!"
        ;;
    Saturday|Sunday)
        echo "Weekend — time to rest!"
        ;;
    *)
        echo "Unknown day"
        ;;
esac
```

---

## Loops

### for Loop

```bash
# Numeric range
for i in {1..5}; do
    echo "Iteration $i"
done

# Step (bash 4+)
for i in {0..20..5}; do
    echo $i   # 0 5 10 15 20
done

# C-style
for (( i=0; i<10; i++ )); do
    echo "i = $i"
done

# Iterate over array
servers=("web01" "web02" "db01")
for server in "${servers[@]}"; do
    echo "Checking $server..."
    ssh $server uptime
done

# Iterate over files
for file in /var/log/*.log; do
    echo "Processing: $file"
    gzip "$file"
done

# Iterate over command output
for user in $(awk -F: '$3 >= 1000 {print $1}' /etc/passwd); do
    echo "Regular user: $user"
done
```

### while Loop

```bash
# Basic while
count=1
while [ $count -le 5 ]; do
    echo "Count: $count"
    (( count++ ))
done

# Read lines from file
while IFS= read -r line; do
    echo "Processing: $line"
done < /etc/hosts

# Infinite loop with break
while true; do
    if ping -c 1 server.local &>/dev/null; then
        echo "Server is up!"
        break
    fi
    echo "Waiting for server..."
    sleep 5
done
```

### Loop Control

```bash
for i in {1..10}; do
    [ $i -eq 5 ] && continue   # skip 5
    [ $i -eq 8 ] && break      # stop at 8
    echo $i
done
# Output: 1 2 3 4 6 7
```

---

## Functions

### Defining and Calling Functions

```bash
#!/usr/bin/env bash

# Define
greet() {
    local name="$1"
    local greeting="${2:-Hello}"
    echo "$greeting, $name!"
}

# Call
greet "Alice"           # Hello, Alice!
greet "Bob" "Hi"        # Hi, Bob!
```

### Return Values

```bash
# Return status code (0-255)
is_even() {
    (( $1 % 2 == 0 ))   # returns exit status
}

if is_even 4; then
    echo "4 is even"
fi

# Return data via echo
get_hostname() {
    echo "$(hostname -s)"
}

host=$(get_hostname)
echo "Running on: $host"
```

### Practical Function Example

```bash
#!/usr/bin/env bash
set -euo pipefail

log() {
    local level="$1"
    shift
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$level] $*" >&2
}

check_command() {
    if ! command -v "$1" &>/dev/null; then
        log "ERROR" "Required command '$1' not found"
        exit 1
    fi
}

retry() {
    local retries="${1}"; shift
    local delay="${1}"; shift
    local attempt=0
    until "$@"; do
        (( attempt++ ))
        if (( attempt >= retries )); then
            log "ERROR" "Command failed after $retries attempts"
            return 1
        fi
        log "WARN" "Attempt $attempt failed. Retrying in ${delay}s..."
        sleep "$delay"
    done
}

# Usage
check_command docker
check_command kubectl
retry 3 5 curl -sf https://api.example.com/health
log "INFO" "All checks passed"
```
