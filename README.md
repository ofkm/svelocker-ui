# <div align="center"><img style="border-radius: 50%;" src="./.gitlab/s.png" width="200"/> <br />Svelocker </div>

<div align="center"><h3>A Simple easy to use docker registry ui built with Typescript and SvelteKit.</h3></div>

## Features:

- Simple and Elegant
- Connects to Local Registries using the official distribution/registry image.
- Fully written in TypeScript and Svelte(Kit)

## Get Started

### Requirements

- Node.JS (v22+)
- Docker and Docker Compose


## Docker Compose (recommended)

```yaml
services:
  svelocker-ui:
    image: ghcr.io/kmendell/svelocker-ui:latest
    restart: unless-stopped
    env_file: .env
    ports:
      - 3000:3000
```

You will need to add the following env setup to your registry container so Svelocker can query and grab all docker information:

```env
      REGISTRY_HTTP_HEADERS_Access-Control-Allow-Origin: '["*"]'
      REGISTRY_HTTP_HEADERS_Access-Control-Allow-Methods: '[HEAD,GET,OPTIONS,DELETE]'
      REGISTRY_HTTP_HEADERS_Access-Control-Allow-Credentials: '[true]'
      REGISTRY_HTTP_HEADERS_Access-Control-Allow-Headers: '[Authorization,Accept,Cache-Control,application/vnd.oci.image.manifest.v1+json]'
      REGISTRY_HTTP_HEADERS_Access-Control-Expose-Headers: '[Docker-Content-Digest]'
```

You can replace the * in the `REGISTRY_HTTP_HEADERS_Access-Control-Allow-Origin: '["*"]'` line to your hostname of Svelocker UI.

## Local Install

```bash
git clone https://github.com/kmendell/svelocker.git

cd svelocker

npm i

npm run dev
```
