Website: https://rehnarama.github.io/MALTE/index.html

# MALTE

Multi Access Live Text Editor

Project in Software Engineering 2019 - Dream Team

# Development

The code is structured into several separate projects, all of which resides
in the folder `packages`.

We manage all projects with node, which means you can install all dependencies
by simply typing `npm install` in each project folder.

## Environment Variables (Frontend)
* `REACT_APP_BACKEND_URL`: (default: `localhost:3000`). The backend URL. All requests and WebSocket connections will be established with this URL

# How to Run

Execute `npm run` in each folder. Frontend will run at port `3000` and backend at port `4000`. You may need to set `REACT_APP_BACKEND_URL` and `REACT_APP_FRONTEND_URL`, e.g. `REACT_APP_BACKEND_URL=192.168.124.5:4000`and `REACT_APP_FRONTEND_URL=192.168.124.5:3000`.

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

