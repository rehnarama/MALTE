import { promises as fs } from "fs";
import { sep } from "path";
import os, { homedir } from "os";

import express from "express";
import socketio from "socket.io";
import fsTree from "./functions/fsTree";
import Project from "./functions/Project";
import cors from "cors";
import Terminal from "./functions/terminal/Terminal";
import mkdirp from "mkdirp";

async function initializeRandomDirectory(): Promise<string> {
  const tmpDir = os.tmpdir();
  const projectRoot = await fs.mkdtemp(`${tmpDir}${sep}`);
  return projectRoot;
}

async function initializeWorkspaceInUserHome(): Promise<string> {
  let projectRoot;
  if (process.env.PROJECT_USERNAME) {
    const dir = `${sep}home${sep}${process.env.PROJECT_USERNAME}${sep}${process.env.PROJECT_DIRECTORY}`;
    projectRoot = dir;
    mkdirp(dir, function(err) {
      if (err) console.error(err);
    });
  } else {
    const dir = `${homedir}${sep}${process.env.PROJECT_DIRECTORY}`;
    console.log("dir to be used = " + dir);
    projectRoot = dir;
    mkdirp(dir, function(err) {
      if (err) console.error(err);
    });
  }
  return projectRoot;
}

async function start(): Promise<void> {
  let projectRoot;
  if (process.env.PROJECT_DIRECTORY) {
    projectRoot = await initializeWorkspaceInUserHome();
  } else {
    console.log("random dir");
    projectRoot = await initializeRandomDirectory();
  }

  const project = new Project(projectRoot);
  await project.initialize();

  const app = express();
  app.use("/", express.static("public_frontend"));
  let port = 4000;
  if (process.env.PORT) {
    port = parseInt(process.env.PORT);
  }

  let frontendUrl = "http://localhost:3000";
  if (process.env.REACT_APP_FRONTEND_URL) {
    frontendUrl = "https://" + process.env.REACT_APP_FRONTEND_URL;
  }

  let whitelist = [frontendUrl];
  if (process.env.REACT_APP_FRONTEND_URL) {
    whitelist = ["https://" + process.env.REACT_APP_FRONTEND_URL];
  }

  const corsOptions = {
    origin: function(origin, callback) {
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    }
  };

  app.use(cors(corsOptions));

  const server = app.listen(port, err => {
    if (err) {
      return console.error(err);
    }
    return console.log(`Server is listening on ${port}`);
  });

  let origins = frontendUrl;
  if (process.env.REACT_APP_FRONTEND_URL) {
    origins = process.env.REACT_APP_FRONTEND_URL + ":*";
  }
  const io = socketio(server, { origins });
  io.on("connection", async socket => {
    console.log(`Socket with id ${socket.id} connected`);
    new Terminal(socket);
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
