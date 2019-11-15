import express from "express";
import socketio from "socket.io";

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
io.on("connection", socket => {
  console.log(`Socket with id ${socket.id} connected`);
  socket.emit("hello-world", { hello: "world" });
});
