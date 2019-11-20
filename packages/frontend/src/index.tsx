import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./components/App";
import Socket from "./functions/Socket";
import io from "socket.io-client";

let backendUrl = "localhost:4000";
if (process.env.REACT_APP_BACKEND_URL) {
  backendUrl = process.env.REACT_APP_BACKEND_URL;
}

const socket = io(backendUrl);
socket.on("connect", () => {
  console.log("Connected to server");
  socket.emit("join-buffer", { path: "tmp.js" });
});

socket.on("file-tree", (data: any) => {
  console.log("file tree was sent", data);
});
Socket.getInstance();

ReactDOM.render(<App socket={socket} />, document.getElementById("root"));
