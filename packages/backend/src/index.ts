import { promises as fs } from "fs";
import { sep } from "path";
import os from "os";

import express from "express";
import socketio from "socket.io";
import fsTree from "./functions/fsTree";
import Project from "./functions/Project";
import cors from "cors";
import Terminal from "./functions/terminal/Terminal";

async function start(): Promise<void> {
  // Initialize a project in a random temporary directory for now
  const tmpDir = os.tmpdir();
  const projectRoot = await fs.mkdtemp(`${tmpDir}${sep}`);
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
    project.join(socket);
    socket.emit("file-tree", await fsTree(projectRoot));

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
