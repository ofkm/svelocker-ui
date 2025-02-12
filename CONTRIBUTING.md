# Contributing

I am happy that you want to contribute toSvelocker and help to make it better! All contributions are welcome, including issues, suggestions, pull requests and more.

## Getting started

You've found a bug, have suggestion or something else, just create an issue on GitHub and we can get in touch.

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

#### Setup

1. Open the project folder
2. Install the dependencies with `npm install`
3. Start the frontend with `npm run dev`

You're all set!

### Testing

We are using [Playwright](https://playwright.dev) for end-to-end testing.

The tests can be run like this:

1. Start the backend normally
2. Start the frontend in production mode with `npm run build && node --env-file=.env build/index.js`
3. Run the tests with `npm run test`
