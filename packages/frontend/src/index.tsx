import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import io from "socket.io-client";


if (process.env.REACT_APP_BACKEND_URL) {
  const socket = io(process.env.REACT_APP_BACKEND_URL);
  socket.on("connect", () => {
    console.log("Connected to server");
  });
  socket.on("hello-world", (data: any) => {
    console.log("hello world was sent", data);
  } );
}

ReactDOM.render(<App />, document.getElementById("root"));
