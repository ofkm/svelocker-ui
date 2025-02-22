# <div align="center"><img src="https://github.com/user-attachments/assets/5a378b40-ce28-414d-a849-f31397425132" width="200"/><br />Svelocker</div>

<div align="center"><h3>A Simple and Modern Docker Registry UI built with Typescript and SvelteKit.</h3>

### Main List View:

<img width="800" alt="image" src="https://github.com/user-attachments/assets/09478366-68ed-43e2-8298-e9feacf50c1c" />

### Details View:

<img width="800" alt="image" src="https://github.com/user-attachments/assets/8256f3df-eac2-4c03-a428-2bc222cf91af" />

</div>

> This project is currently in development and items, themes, and features may change or not be available.

## Features:

- Simple and Modern
- Easy Setup
- Connects to Local Registries using the official [distribution/registry](https://hub.docker.com/_/registry) container image.
- Delete Image Tags from the UI
- SQLite Cache Layer for registry data

## Get Started

### Requirements

- Docker and Docker Compose
- Private Container Registry using the [distribution/registry](https://hub.docker.com/_/registry) container.

## Docker Compose (recommended)

Modify the env file to fit your setup:

```env
# Registry Settings
PUBLIC_REGISTRY_URL=https://registry.example.com # Registry URL
PUBLIC_REGISTRY_NAME=My Docker Registry          # Display name
PUBLIC_API_URL=http://localhost:3000             # API endpoint

# Database
DB_PATH=data/svelockerui.db                      # SQLite database path inside container

# Docker API Configuration
PRIVATE_DOCKER_API_VERSION=v1.41 #API Version of your docker host
PRIVATE_DOCKER_HTTP_HOST=10.0.0.10 #The host IP of your docker host
PRIVATE_DOCKER_HTTP_PORT=2375 #The port your docker host api is listening on
PRIVATE_DOCKER_REGISTRY_CONTAINER=registry #Name of the registry container in docker

# Feature Flags
PUBLIC_ENABLE_GARBAGE_COLLECT=true
```

```yaml
services:
  svelocker-ui:
    image: ghcr.io/kmendell/svelocker-ui:latest
    restart: unless-stopped
    env_file: .env
    ports:
      - 3000:3000
    volumes:
      - ./data:/app/data
```

Access Svelocker UI on http://dockerip:3000

**Note if your registry is secured by HTTPS then Svelocker UI need to be secured by HTTPS as well.**

The Registry Container will need to be configured to allow Queries from Svelocker UI, Set the Environment Variables below replacing `https://svelocker.example.com` the hostname Svelocker will be running on.

```env
REGISTRY_HTTP_HEADERS_Access-Control-Allow-Origin: '[https://svelocker.example.com]'
REGISTRY_HTTP_HEADERS_Access-Control-Allow-Methods: '[HEAD,GET,OPTIONS,DELETE]'
REGISTRY_HTTP_HEADERS_Access-Control-Allow-Credentials: '[true]'
REGISTRY_HTTP_HEADERS_Access-Control-Allow-Headers: '[Authorization,Accept,Cache-Control]'
REGISTRY_HTTP_HEADERS_Access-Control-Expose-Headers: '[Docker-Content-Digest]'
```

You can replace the Access-Control-Allow-Origin line to this `REGISTRY_HTTP_HEADERS_Access-Control-Allow-Origin: '["*"]'` lto allow traffic from all origins but this is not recommended.

# Additional Information

- All the API Calls to the Registry happen Server-Side, the only exceptions to this are the `Copy Dockerfile`.

# Shoutouts

- Shoutout to [joxi/docker-registry-ui](https://github.com/Joxit/docker-registry-ui) for the inspiration for this project.
- Shoutout to [pocket-id/pocket-id](https://github.com/pocket-id/pocket-id) for the SvelteKit inspiration and the Dropdown Card Component.
