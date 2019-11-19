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
  const port = 4000;

  let whitelist = ["http://127.0.0.1:4000"];
  if (process.env.REACT_APP_FRONTEND_URL) {
    whitelist = ["http://" + process.env.REACT_APP_FRONTEND_URL];
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
  app.get("/", (req, res) => {
    res.send("YAY! It actually works!");
  });

  const server = app.listen(port, err => {
    if (err) {
      return console.error(err);
    }
    return console.log(`Server is listening on ${port}`);
  });

  const sockets: socketio.Socket[] = [];
  let origins = "127.0.0.1:3000";
  if (process.env.REACT_APP_FRONTEND_URL) {
    origins = process.env.REACT_APP_FRONTEND_URL;
  }
  const io = socketio(server, { origins });
  io.on("connection", async socket => {
    console.log(`Socket with id ${socket.id} connected`);
    sockets.push(socket);
    new Terminal(socket);
    socket.emit("file-tree", await fsTree(projectRoot));
  });

  project.getWatcher().on("all", async () => {
    const tree = await fsTree(projectRoot);
    for (const socket of sockets) {
      socket.emit("file-tree", tree);
    }
  });
}

start();
