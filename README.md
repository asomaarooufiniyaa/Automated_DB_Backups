# Automated Infrastructure Deployment and Application Setup

This project automates the provisioning of cloud infrastructure on AWS using Terraform, and the deployment of a Dockerized application using Ansible.

---

## Table of Contents
- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Setup & Deployment](#setup--deployment)
- [Usage](#usage)
- [Challenges Faced](#challenges-faced)
- [License](#license)

---

## Project Overview

The purpose of this project is to automate the following tasks:

1. Provision an AWS infrastructure including:
   - VPC, subnet, internet gateway, route table
   - Security group allowing SSH, HTTP, and HTTPS
   - EC2 instance with public IP
   - SSH key management

2. Deploy a Dockerized web application on the provisioned EC2 instance using Ansible.

3. Run multiple containers:
   - `test` application container
   - `mongo` database container
   - `nginx` reverse proxy

---

## Architecture

```

AWS Cloud
┌───────────────────────┐
│       VPC             │
│  ┌───────────────┐    │
│  │ Subnet        │    │
│  │ ┌─────────┐  │    │
│  │ │ EC2     │  │    │
│  │ │         │  │    │
│  │ │ Docker  │  │    │
│  │ │ Compose │  │    │
│  │ └─────────┘  │    │
│  └───────────────┘    │
└───────────────────────┘

Docker Containers:

* `test` app
* `mongo` database
* `nginx` reverse proxy

````

---

## Prerequisites

- AWS account with access keys
- Terraform 1.5+
- Ansible 2.15+
- Docker & Docker Compose (installed via Ansible on the EC2 instance)
- GitHub repository with required secrets:
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `SSH_PRIVATE_KEY`
  - `DOCKER_USERNAME`
  - `DOCKER_PASSWORD`

---

## Setup & Deployment

1. Clone the repository:

```bash
git clone https://github.com/asomaarooufiniyaa/Automated_DB_Backups.git
cd Automated_DB_Backups
````

2. Configure GitHub secrets for CI/CD (GitHub Actions).

3. GitHub Actions workflow will perform:

   * Terraform init, validate, and apply
   * Ansible playbook execution
   * Docker container deployment

4. Directory structure:

```
├── ansible/
│   ├── inventories/
│   │   └── hosts.ini
│   └── playbooks/
│       ├── setup.yml
│       └── deploy.yml
├── app/
│   ├── docker-compose.yml
│   └── nginx.conf
├── terraform/
│   ├── instance.tf
│   ├── network.tf
│   ├── security.tf
│   └── outputs.tf
└── .github/workflows/provision.yml
```

---

## Usage

* After deployment, you can access the application via the public IP of the EC2 instance.
* Docker containers are managed with `docker-compose` through Ansible.

---

## Challenges Faced

1. **SSH Key Issues on CI/CD**
   Initially, the workflow failed to connect to EC2 due to key format issues. Fixed by using `tr -d '\r'` to remove Windows-style line endings from the private key.

2. **Ansible & Docker Integration**
   Running Docker containers with mounted volumes caused errors when the host path did not exist or had wrong permissions. Solved by copying configuration files to the correct paths on the server before running `docker-compose`.

3. **GitHub Actions Permissions**
   Managing secrets and environment variables correctly was essential for Terraform and Ansible to work on GitHub runners.

4. **Terraform Resource Conflicts**
   Errors like `InvalidKeyPair.Duplicate` occurred when the AWS key already existed. Solved by checking existing resources or importing them if needed.

## License

This project is open source and available under the MIT License.
