# <div align="center"><img style="border-radius: 50%;" src="./.gitlab/s.png" width="200"/> <br />Svelocker </div>

<div align="center"><h3>A Simple easy to use docker registry ui built with Typescript and SvelteKit.</h3></div>

## Features:

- Simple and Elegant
- Connects to Local Registries using the office registry image.
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

## Local Install

```bash
git clone https://github.com/kmendell/svelocker.git

cd svelocker

npm i

npm run dev
```
