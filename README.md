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

# Install

Follow the Install guide [here](https://github.com/kmendell/svelocker-ui/wiki/Installation)

# Additional Information

- All the API Calls to the Registry happen Server-Side, the only exceptions to this are the `Copy Dockerfile`.

# Shoutouts

- Shoutout to [joxi/docker-registry-ui](https://github.com/Joxit/docker-registry-ui) for the inspiration for this project.
- Shoutout to [pocket-id/pocket-id](https://github.com/pocket-id/pocket-id) for the SvelteKit inspiration and the Dropdown Card Component.
