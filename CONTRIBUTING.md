# Contributing

## Getting started

## Submit a Pull Request

Before you submit the pull request for review please ensure that

- The pull request naming follows the [Conventional Commits specification](https://www.conventionalcommits.org):

  `<type>[optional scope]: <description>`

  example:

  ```
  feat(share): add password protection
  ```

  Where `TYPE` can be:

  - **feat** - is a new feature
  - **doc** - documentation only changes
  - **fix** - a bug fix
  - **refactor** - code change that neither fixes a bug nor adds a feature

- Your pull request has a detailed description
- You run `npm run format` to format the code

## Setup project

The frontend is built with [SvelteKit](https://kit.svelte.dev) and written in TypeScript.
The backend is written in Go and built with GIN and GORM for the database.

#### Setup

1. Open the project folder
2. Copy the .env.example to the backend and frontend folders, and rename it .env, and make the correct modifications.
3. Install the frontend dependencies with `cd frontend && npm install`
4. Start the backend `cd backend && go run cmd/server/main.go`
5. Start the frontend with `cd frontend && npm run dev`
