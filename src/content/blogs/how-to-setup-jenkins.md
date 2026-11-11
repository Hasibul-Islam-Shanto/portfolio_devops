---
title: "Build a Jenkins CI/CD Pipeline with Docker, SonarQube, and Trivy"
description: "A beginner-friendly, end-to-end guide to installing Jenkins and building a secure CI/CD pipeline for a Docker Compose application."
pubDate: 2026-09-25
tags: ["jenkins", "ci-cd", "docker", "sonarqube", "trivy", "devops"]
readTime: "18 min read"
draft: false
---

This guide explains how to build a complete Jenkins CI/CD pipeline on one Ubuntu server. It uses the DevTalk repository as a practical example, but the same process works for most Docker Compose projects.

By the end, every push to GitHub can automatically:

- download the latest code;
- run the frontend and backend tests;
- inspect code quality with SonarQube;
- scan dependencies and files with Trivy;
- build Docker images; and
- deploy the application with Docker Compose.

You do not need to be a Jenkins expert. Each section explains what to do, why it is needed, and how to confirm that it works.

## Step 1: Understand the final architecture

![DevTalk Jenkins CI/CD pipeline architecture](/images/blog/devTalk-jenkins-cicd.png)

A developer pushes code to GitHub, and a webhook tells Jenkins to start the pipeline. Jenkins then completes each stage in order: clone, test, analyze, scan, build, and deploy. The final application runs as a Docker Compose stack containing the frontend, backend, MongoDB, and Redis.

The machine runs four things side by side:

| Process          | Port on the host | Why that port                                                                                                    |
| ---------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------- |
| Jenkins          | 8080             | Default Jenkins port. Leave it here.                                                                             |
| DevTalk frontend | 3000             | Published by Compose.                                                                                            |
| DevTalk API      | 8082             | The API container still listens on 8080 internally. The host publishes 8082 so it does not collide with Jenkins. |
| SonarQube        | 9000             | Default SonarQube port.                                                                                          |

MongoDB and Redis are not published. The API reaches them on the Compose network as `mongo` and `redis`.

## Step 2: Prepare the Ubuntu server

Use an Ubuntu server with at least 4 GB of RAM. An 8 GB server is safer when Jenkins, SonarQube, and the application run together. SonarQube uses more memory than the other services and may stop if the server runs out of RAM.

Allow these inbound TCP ports in the server firewall or cloud security group:

- `22` for SSH;
- `3000` for the DevTalk frontend;
- `8080` for Jenkins;
- `8082` for the DevTalk API; and
- `9000` for SonarQube.

Only expose ports that you actually need. In production, place Jenkins and SonarQube behind HTTPS and restrict who can access them.

## Step 3: Install Docker and Docker Compose

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-v2
```

Confirm both commands work:

```bash
docker --version
docker compose version
```

## Step 4: Install Jenkins

Jenkins requires Java. Install Java first, create the APT keyring directory, and then add the official Jenkins stable repository:

```bash
sudo apt-get install -y fontconfig openjdk-21-jre
sudo install -m 0755 -d /etc/apt/keyrings
sudo wget -O /etc/apt/keyrings/jenkins-keyring.asc \
  https://pkg.jenkins.io/debian-stable/jenkins.io-2026.key
echo "deb [signed-by=/etc/apt/keyrings/jenkins-keyring.asc]" \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt update
sudo apt install -y jenkins
sudo systemctl enable --now jenkins
```

Jenkins runs as the `jenkins` user. That user must be allowed to run Docker:

```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

Open `http://YOUR_SERVER:8080`. The unlock password is in:

```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

Choose **Install suggested plugins**, create the admin user, and keep the Jenkins URL as `http://YOUR_SERVER:8080/`.

## Step 5: Install Trivy

Trivy scans the checked-out project for known vulnerabilities and insecure dependencies. The Jenkins scan stage calls `trivy` directly on the host, so install it on the same server:

```bash
sudo apt-get install -y wget gnupg
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | gpg --dearmor | sudo tee /usr/share/keyrings/trivy.gpg > /dev/null
echo "deb [signed-by=/usr/share/keyrings/trivy.gpg] https://aquasecurity.github.io/trivy-repo/deb generic main" | sudo tee /etc/apt/sources.list.d/trivy.list
sudo apt-get update
sudo apt-get install -y trivy
```

Confirm the installation:

```bash
trivy --version
```

## Step 6: Run the SonarQube server

SonarQube reviews source code for bugs, code smells, duplication, and maintainability issues. Its embedded Elasticsearch service needs a higher memory-map limit:

```bash
sudo sysctl -w vm.max_map_count=262144
echo "vm.max_map_count=262144" | sudo tee /etc/sysctl.d/99-sonarqube.conf

docker run -itd \
  --name sonarqube-server \
  --restart unless-stopped \
  -p 9000:9000 \
  sonarqube:lts-community
```

> The image tag is `lts-community`, not `lst-community`. The container name is also corrected to `sonarqube-server`.

Open `http://YOUR_SERVER:9000`, sign in with username `admin` and password `admin`, and change the default password when prompted. It may take a minute for the page to become available.

Check the container if SonarQube does not open:

```bash
docker ps --filter name=sonarqube-server
docker logs sonarqube-server
docker inspect -f 'OOMKilled={{.State.OOMKilled}} ExitCode={{.State.ExitCode}}' sonarqube-server
```

If `OOMKilled=true` appears, the server needs more memory. Restarting it will not solve the problem permanently if there is still not enough RAM.

## Step 7: Install the required Jenkins plugins

Go to **Manage Jenkins → Plugins → Available plugins** and install:

| Plugin              | Why this project uses it                                 |
| ------------------- | -------------------------------------------------------- |
| Pipeline            | Runs the `Jenkinsfile`. Included with suggested plugins. |
| Git                 | Checks out the GitHub repository.                        |
| GitHub              | Receives push webhooks.                                  |
| Credentials Binding | Injects `JWT_SECRET` into the build.                     |
| SonarQube Scanner   | Provides `tool 'Sonar'` and `withSonarQubeEnv`.          |

Restart Jenkins after the installs finish.

## Step 8: Connect Jenkins to SonarQube

1. In SonarQube, open **My Account → Security** and generate a token. Copy it once.
2. In Jenkins, open **Manage Jenkins → Credentials → System → Global credentials → Add Credentials**.
3. Kind: **Secret text**. Secret: the SonarQube token. ID: `sonarqube-token`.
4. Open **Manage Jenkins → System → SonarQube servers → Add SonarQube**.
5. Name: `Sonar`. Server URL: `http://YOUR_SERVER:9000`. Server authentication token: `sonarqube-token`.
6. Open **Manage Jenkins → Tools → SonarQube Scanner installations → Add SonarQube Scanner**.
7. Name: `Sonar`. Check **Install automatically** and pick a recent scanner version.

The name `Sonar` has to match both places. `vars/sonarScan.groovy` calls `tool 'Sonar'` and `withSonarQubeEnv('Sonar')`.

## Step 9: Configure the Jenkins shared library

This repository keeps each pipeline step in `vars/`. Jenkins loads that folder as a Global Pipeline Library named `devtalk-shared`.

1. Open **Manage Jenkins → System → Global Pipeline Libraries → Add**.
2. Name: `devtalk-shared`.
3. Default version: `main`.
4. Retrieval method: **Modern SCM**.
5. Source Code Management: **Git**.
6. Repository URL: `https://github.com/Hasibul-Islam-Shanto/devtalk.git`.
7. Credentials: add a GitHub username and personal access token if the repository is private. For a public repository you can leave credentials empty.

The library name must be exactly `devtalk-shared`, because the Jenkinsfile starts with `@Library('devtalk-shared') _`.

For your own project, pick any library name and use that same string in the Jenkinsfile. The `vars/` folder must sit at the root of the repository the library points at.

## Step 10: Add the application secret to Jenkins

The API refuses to start without `JWT_SECRET`. Store it in Jenkins, not in Git.

1. **Manage Jenkins → Credentials → System → Global credentials → Add Credentials**.
2. Kind: **Secret text**.
3. Secret: a long random string.
4. ID: `devtalk-jwt-secret`.

`buildApp` and `deployApp` load that ID with `withCredentials`.

## Step 11: Create the application environment file

Public URLs are baked into the frontend image at build time. Keep them in a file on the server so a GitHub push does not depend on typing them into Jenkins.

Create `/var/lib/jenkins/devtalk.env` as the `jenkins` user:

```bash
sudo tee /var/lib/jenkins/devtalk.env >/dev/null <<'EOF'
CLIENT_URL=http://YOUR_SERVER:3000
NEXT_PUBLIC_API_URL=http://YOUR_SERVER:8082
NEXT_PUBLIC_DEPLOY_URL=http://YOUR_SERVER:3000
COOKIE_SECURE=false
EOF
sudo chown jenkins:jenkins /var/lib/jenkins/devtalk.env
sudo chmod 600 /var/lib/jenkins/devtalk.env
```

Replace `YOUR_SERVER` with the public IP or domain users type in the browser. `COOKIE_SECURE=false` is required while the site is plain HTTP. Set it to `true` only behind HTTPS.

| Variable                 | Who uses it                                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `CLIENT_URL`             | The API allows Socket.IO only from this origin. It must match the address in the browser, including the port. |
| `NEXT_PUBLIC_API_URL`    | Compiled into the frontend. The browser opens Socket.IO and API calls against this URL.                       |
| `NEXT_PUBLIC_DEPLOY_URL` | Compiled into the frontend. Used when the browser calls the Next.js app itself.                               |
| `COOKIE_SECURE`          | Marks auth cookies Secure.                                                                                    |

Do not commit this file. Do not put `JWT_SECRET` in it. Jenkins injects that from the credential.

Inside Compose, the Next.js server talks to the API at `http://backend:8080`. That address is only valid on the Docker network. The browser cannot use it, which is why `NEXT_PUBLIC_API_URL` is the public `8082` address.

## Step 12: Create the Jenkins pipeline job

1. From the Jenkins dashboard, click **New Item**.
2. Name: `devtalk`. Type: **Pipeline**. Click **OK**.
3. Description:

```text
CI/CD pipeline for DevTalk. Checks out the repository, tests the API and the Next.js app, runs SonarQube and Trivy, then builds and deploys the Docker Compose stack.
```

4. Under **Build Triggers**, check **GitHub hook trigger for GITScm polling**.
5. Under **Pipeline**, set Definition to **Pipeline script from SCM**.
6. SCM: **Git**.
7. Repository URL: `https://github.com/Hasibul-Islam-Shanto/devtalk.git`.
8. Branch: `*/main`.
9. Script Path: `Jenkinsfile`.
10. Save.

If Definition is **Pipeline script from SCM** but SCM is left blank, Jenkins checks out `NullSCM` and fails immediately with `Jenkinsfile not found`. The Git section above is what fixes that.

### Add the GitHub webhook

In the GitHub repository, open **Settings → Webhooks → Add webhook**.

- Payload URL: `http://YOUR_SERVER:8080/github-webhook/`
- Content type: `application/json`
- Event: **Just the push event**

A push to `main` now starts the `devtalk` job.

## Step 13: Understand the Jenkinsfile

`Jenkinsfile` is a declarative pipeline. It names the stages and calls one Groovy step each. The work lives in `vars/`, because a Global Pipeline Library turns each file into a step: `vars/testApp.groovy` becomes `testApp()`.

```groovy
@Library('devtalk-shared') _

pipeline {
    agent any

    stages {
        stage('Code clone from Github') {
            steps {
                script {
                    cloneRepo(scm)
                }
            }
        }
        stage('Test') { steps { testApp() } }
        stage('SonarQube Quality Analysis') { steps { sonarScan() } }
        stage('Trivy File System Scan') { steps { trivyScan() } }
        stage('Build') { steps { buildApp() } }
        stage('Deploy') {
            when {
                expression { return env.BRANCH_NAME == null || env.BRANCH_NAME == 'main' }
            }
            steps { deployApp() }
        }
    }
}
```

`agent any` runs on the built-in Jenkins node, which is this same machine, so Docker and Trivy are available.

`cloneRepo(scm)` receives the job's Git configuration. Calling `checkout scm` from inside the shared library would check out the library repository instead of the job repository. Passing `scm` from the Jenkinsfile avoids that.

Deploy runs when `BRANCH_NAME` is empty (a single Pipeline job) or when the branch is `main`. A multibranch job can later skip deploy for feature branches without renaming the stage.

## Step 14: Understand the shared-library steps

### `vars/cloneRepo.groovy`

```groovy
def call(scmSource) {
    checkout scmSource
}
```

`def call` is the function Jenkins runs when the step name is used. `checkout` downloads the commit GitHub just pushed into the job workspace.

### `vars/testApp.groovy`

Tests run in Docker so the Jenkins machine does not need Node.js installed.

- The API workspace is mounted into `node:20-alpine`. The container runs `npm ci`, lint, and `npx vitest run --coverage`. `npm test` alone starts Vitest in watch mode and would hang the job.
- The frontend workspace is mounted into `node:22-alpine`. The container runs `npm ci`, lint, `type-check`, and `test:coverage`.
- `HUSKY=0` skips Git hooks during install.
- Coverage files are written back into the workspace because the folders are mounted. SonarQube reads them in the next stage.

### `vars/sonarScan.groovy`

```groovy
def call() {
    def scannerHome = tool 'Sonar'
    withSonarQubeEnv('Sonar') {
        sh "${scannerHome}/bin/sonar-scanner"
    }
}
```

`tool 'Sonar'` is the scanner installation from **Manage Jenkins → Tools**. `withSonarQubeEnv('Sonar')` injects the server URL and token. The scanner reads `sonar-project.properties` in the repository root, including the project key `devTalk` and the coverage report paths. The scan stage is after tests so those reports exist.

### `vars/trivyScan.groovy`

```groovy
def call() {
    sh 'trivy fs --exit-code 0 --format table -o trivy-fs-report.txt .'
    archiveArtifacts artifacts: 'trivy-fs-report.txt', allowEmptyArchive: true
}
```

Trivy scans the workspace for known vulnerabilities and archives `trivy-fs-report.txt` on the build page. `--exit-code 0` records findings without failing the pipeline. Change `0` to `1` later if a vulnerability should block the deploy.

### `vars/buildApp.groovy` and `vars/deployApp.groovy`

Both steps do the same preparation, then a different Compose command.

1. `withCredentials` puts `JWT_SECRET` in the shell from the credential `devtalk-jwt-secret`.
2. The script loads `/var/lib/jenkins/devtalk.env`.
3. It clears `CLIENT_URL` and the `NEXT_PUBLIC_` variables first, so an old value left in the Jenkins process cannot override the file.
4. It checks that the three URLs are set.
5. Build runs `docker compose build`. Deploy runs `docker compose up -d --build`.

`docker compose up -d --build` is enough on every deploy. Compose rebuilds images that changed and recreates containers whose settings changed. It leaves the MongoDB and Redis volumes in place. Do not run `docker compose down -v` from the pipeline. The `-v` flag deletes those volumes.

## Step 15: Understand the Docker Compose deployment

`docker-compose.yml` at the repository root describes four services:

- `mongo` stores application data in the `mongo_data` volume.
- `redis` has no password in this setup. The API connects to `redis://redis:6379`.
- `backend` is built from `devTalk-be/Dockerfile`. Host port `8082` maps to container port `8080`.
- `frontend` is built from `devTalk-fe/Dockerfile`. `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_DEPLOY_URL` are build arguments, so changing them requires a new image build. Restarting the old container is not enough.

The frontend container calls the API at `http://backend:8080` for server-side requests. The browser uses the public URL from `NEXT_PUBLIC_API_URL`. Socket.IO connects to that same public URL, and the API accepts the connection only when the page origin equals `CLIENT_URL`.

If the socket stays disconnected after a deploy, check two things. The security group must allow port `8082`. The values in `devtalk.env` must be the public address, then the job must run again so the frontend image is rebuilt.

## Step 16: Run and verify the pipeline

Push the `Jenkinsfile` and the `vars/` directory to `main`. In Jenkins, open the `devtalk` job and click **Build Now**.

A healthy run shows six stages in order: clone, test, SonarQube, Trivy, build, deploy. Afterward:

- App: `http://YOUR_SERVER:3000`
- API health: `http://YOUR_SERVER:8082/health`
- SonarQube project: `http://YOUR_SERVER:9000` under the key `devTalk`
- Trivy report: the build page, under **Build Artifacts**

If a stage fails, open that stage in Jenkins and read its console output. Fix the first clear error, then run the job again. Later errors are often side effects of the first failure.

## Step 17: Adapt the pipeline for another project

1. Install Jenkins, Docker, and Trivy the same way.
2. Point the Global Pipeline Library at your repository and match the `@Library` name.
3. Add a `Jenkinsfile` that only lists stages, and put each stage body in `vars/yourStep.groovy` with a `def call()`.
4. Change `testApp` to the images and commands your app needs.
5. Point `sonar-project.properties` at your source folders.
6. Replace `docker-compose.yml` with your services. Keep secrets in Jenkins credentials and public URLs in a file under `/var/lib/jenkins/`.
7. Create a Pipeline job with **Pipeline script from SCM**, Script Path `Jenkinsfile`, and a GitHub push webhook.

Start with clone, test, and one Docker build. Add SonarQube, Trivy, and deployment only after the basic pipeline is working. Building it in small steps makes failures much easier to understand.

## Final result

You now have a practical CI/CD workflow: GitHub starts Jenkins, Jenkins tests and scans the code, Docker Compose builds the services, and the main branch deploys automatically.

This setup is suitable for learning and portfolio projects. Before using it in production, add HTTPS, restrict access to Jenkins and SonarQube, back up persistent data, pin container image versions, and use a proper secret-management system.
