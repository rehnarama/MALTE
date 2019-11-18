import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./components/App";
import io from "socket.io-client";

let backendUrl = "localhost:4000";
if (process.env.REACT_APP_BACKEND_URL) {
  backendUrl = process.env.REACT_APP_BACKEND_URL;
}

const socket = io(backendUrl);
socket.on("connect", () => {
  console.log("Connected to server");
});
socket.on("hello-world", (data: any) => {
  console.log("hello world was sent", data);
});

ReactDOM.render(<App />, document.getElementById("root"));
