# <div align="center"><img src="https://github.com/user-attachments/assets/5a378b40-ce28-414d-a849-f31397425132" width="200"/><br />Svelocker</div>

<div align="center"><h3>A Simple and Modern Docker Registry UI built with Typescript and SvelteKit.</h3>

### Home Page:

<img width="800" alt="image" src="https://github.com/user-attachments/assets/79d38083-60fd-4a59-9fa3-11cabb040147" />

### Home Page Card:

<img width="800" alt="image" src="https://github.com/user-attachments/assets/9fb1e8d2-9710-4401-9ef1-8cd7a5fac27f" />

### Repo Details:

<img width="800" alt="image" src="https://github.com/user-attachments/assets/b532c4c9-656b-4310-b4b0-925b4b5ad1a2" />

### Image Tag Details:

<img width="800" alt="image" src="https://github.com/user-attachments/assets/3eef20f0-64ce-4f4a-9cd6-4518e7eafed4" />


</div>


> [!IMPORTANT]
> This project is currently in development. Features, Themes, and other items may not be available or are subject to change.

## Features:

- Simple and Modern
- Easy Setup
- Connects to Local Registries using the official [distribution/registry](https://hub.docker.com/_/registry) container image.
- Delete Image Tags from the UI
- SQLite Cache Layer for registry data
- View and Copy the Dockerfile from the UI

## Get Started

### Requirements

- Docker and Docker Compose
- Private Container Registry using the [distribution/registry](https://hub.docker.com/_/registry) container.

# Install

Follow the Install guide [here](https://github.com/kmendell/svelocker-ui/wiki/Installation)

# Additional Information

- All the API Calls to the Registry happen Server-Side, the only exceptions to this are the `Copy Dockerfile`.

# Shoutouts

- Shoutout to [joxi/docker-registry-ui](https://github.com/Joxit/docker-registry-ui) for the inspiration for this project.
- Shoutout to [pocket-id/pocket-id](https://github.com/pocket-id/pocket-id) for the SvelteKit inspiration and the Dropdown Card Component.
