import express from "express";
import socketio from "socket.io";
import fsTree from "./functions/fsTree";

// This is the project root! In the future we will maybe move this to an
// environment variable so we can customize it. Perhaps also
// auto generate this folder if doesn't exist?
const PROJECT_ROOT = ".";

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

const io = socketio(server);
io.on("connection", async socket => {
  console.log(`Socket with id ${socket.id} connected`);

  socket.emit("file-tree", await fsTree(PROJECT_ROOT));
});
