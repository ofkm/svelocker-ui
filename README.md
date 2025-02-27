# <div align="center"><img src="https://github.com/user-attachments/assets/5a378b40-ce28-414d-a849-f31397425132" width="200"/><br />Svelocker</div>

<div align="center"><h3>A Simple and Modern Docker Registry UI built with Typescript and SvelteKit.</h3>

### Main List View:

<img width="800" alt="image" src="https://github.com/user-attachments/assets/ba7348d7-f366-40d7-8571-fdd420c6d353" />

### Details View:

<img width="800" alt="image" src="https://github.com/user-attachments/assets/3c5c248a-0abc-48a3-be24-fb9349064262" />

</div>


> [!IMPORTANT]
> This project is currently in development. Features, Themes, and other items my not be available or are subject to change.

## Features:

- Simple and Modern
- Easy Setup
- Connects to Local Registries using the official [distribution/registry](https://hub.docker.com/_/registry) container image.
- Delete Image Tags from the UI
- SQLite Cache Layer for registry data
- View and Copy the Dockerfile from the UI
- 

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
