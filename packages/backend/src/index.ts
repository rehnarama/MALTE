import { promises as fs } from "fs";
import { sep } from "path";
import os from "os";

import express from "express";
import socketio from "socket.io";
import fsTree from "./functions/fsTree";
import Project from "./functions/Project";

async function start(): Promise<void> {
  // Initialize a project in a random temporary directory for now
  const tmpDir = os.tmpdir();
  const projectRoot = await fs.mkdtemp(`${tmpDir}${sep}`);
  const project = new Project(projectRoot);
  await project.initialize();

  const app = express();
  const port = 4000;

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
  const io = socketio(server);
  io.on("connection", async socket => {
    console.log(`Socket with id ${socket.id} connected`);
    sockets.push(socket);

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
