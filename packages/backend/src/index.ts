import { promises as fs } from "fs";
import { sep } from "path";
import os, { homedir } from "os";

import express from "express";
import cookieParser from "cookie-parser";
import socketio from "socket.io";
import fsTree from "./functions/fsTree";
import Project from "./functions/Project";
import cors from "cors";
import Terminal from "./functions/terminal/Terminal";
import path from "path";
import GitHub from "./functions/oauth/GitHub";
import { FileSystem } from "./functions/filesystem";

const PORT = Number.parseInt(process.env.PORT) || 4000;
let frontendUrl = "http://localhost:3000";
if (process.env.REACT_APP_FRONTEND_URL) {
  frontendUrl = process.env.REACT_APP_FRONTEND_URL;
}

async function initializeRandomDirectory(): Promise<string> {
  const tmpDir = os.tmpdir();
  const projectRoot = await fs.mkdtemp(`${tmpDir}${sep}`);
  return projectRoot;
}

async function initializeWorkspaceInUserHome(): Promise<string> {
  let projectRoot;
  if (process.env.PROJECT_USERNAME) {
    const dir = path.join(
      homedir(),
      "..",
      process.env.PROJECT_USERNAME,
      process.env.PROJECT_DIRECTORY
    );
    projectRoot = dir;
    await fs.mkdir(dir, { recursive: true });
  } else {
    const dir = path.join(homedir(), process.env.PROJECT_DIRECTORY);
    projectRoot = dir;
    await fs.mkdir(dir, { recursive: true });
  }
  return projectRoot;
}

async function start(): Promise<void> {
  let projectRoot;
  if (process.env.PROJECT_DIRECTORY) {
    projectRoot = await initializeWorkspaceInUserHome();
  } else {
    projectRoot = await initializeRandomDirectory();
  }

  const project = new Project(projectRoot);
  await project.initialize();

  const app = express();
  app.use(cookieParser());
  app.use("/", express.static("public_frontend"));

  const whitelist = [frontendUrl];
  const corsOptions = {
    origin: function(
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ): void {
      // origin is undefined if same origin or server-2-server
      if (!origin || whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  };
  app.use(cors(corsOptions));

  new GitHub(app);

  const server = app.listen(PORT, err => {
    if (err) {
      return console.error(err);
    }
    return console.log(`Server is listening on ${PORT}`);
  });

  // For some reason, socket.io refuses to work on heroku unless all
  // ports are allowed, so let's make it so!
  const origins = frontendUrl.replace(/:\d+$/, "") + ":*";
  const io = socketio(server, { origins });
  io.on("connection", async socket => {
    console.log(`Socket with id ${socket.id} connected`);

    new Terminal(socket, projectRoot);
    new FileSystem(socket, projectRoot);
    project.join(socket);

    // send file tree on request from client
    socket.on("refresh-file-tree", async () => {
      socket.emit("file-tree", await fsTree(projectRoot));
    });
  });

  // send file tree when filesystem changes
  project.getWatcher().on("all", async () => {
    const tree = await fsTree(projectRoot);
    io.sockets.emit("file-tree", tree);
  });
}

start();
