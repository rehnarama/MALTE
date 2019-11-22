Website: https://rehnarama.github.io/MALTE/index.html

# MALTE

Multi Access Live Text Editor

Project in Software Engineering 2019 - Dream Team

# Development

The code is structured into several separate projects, all of which resides
in the folder `packages`.

We manage all projects with node, which means you can install all dependencies
by simply typing `npm install` in each project folder.

# How to Run

Execute `npm run` in each folder. Depending on your setup, you may need to set enviroment variables.

## Dependencies

### Backend

- node.js >12.X
- node-pty dependencies, see [here](https://github.com/microsoft/node-pty#dependencies)

### Frontend

- node.js >12.X

## malte-common

`malte-common` is a supporting library which allows us to share code and type
definitions between frontend and backend. This library, however, has to be
built whenever it's changed (this is a nuisance, I know, but there is currently
no other way to support mono-repos in create-react-app, see this
[issue](https://github.com/facebook/create-react-app/issues/1333)).

To build `malte-common` once, enter `packages/malte-common` and run

```sh
npm run build
```

To have it build continually in the background, simply run

```sh
npm run build:watch
```

in a background job/tab.

## Environment Variables (Backend)

- `REACT_APP_BACKEND_URL`: (default: `http://127.0.0.1:3000`). The backend URL. All requests and WebSocket connections will be established with this URL. e.g. `REACT_APP_BACKEND_URL=http://192.168.124.5:4000`
- `REACT_APP_FRONTEND_URL`: (default: `http://localhost:3000`). E.g.`REACT_APP_FRONTEND_URL=http://192.168.124.5:3000`
- `GH_CLIENT_ID`: (no default). The GitHub OAuth app client id. (Contact `rehn.michael@outlook.com` to get it)
- `GH_CLIENT_SECRET`: (no default). The GitHub OAuth app client secret. (Contact `rehn.michael@outlook.com` to get it)

## Environment Variables (Frontend)
- `REACT_APP_BACKEND_URL`: (default: `http://127.0.0.1:3000`). The backend URL. All requests and WebSocket connections will be established with this URL. e.g. `REACT_APP_BACKEND_URL=http://192.168.124.5:4000`
- `PROJECT_DIRECTORY` - name of the workspace. Will create folder in `/home/${PROJECT_USERNAME}/${PROJECT_USERNAME}`

# Code Styling

We use `prettier` for styling and `eslint` for code checks. `eslint` is
configured with their recommended configuration as well as checking for the
default prettier configuration. You can run all checks by running the command

```sh
npm run lint
```

in the project folder for `frontend` and `backend`.

The eslint plugin for Visual Studio Code does check eslint errors in typescript
files by default. You have to enable this with the following configuration in
Visual Studio Code:

```json
{
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    {
      "autoFix": true,
      "language": "typescript"
    },
    {
      "autoFix": true,
      "language": "typescriptreact"
    }
  ]
}
```
