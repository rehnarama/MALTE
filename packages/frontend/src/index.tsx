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

ReactDOM.render(<App />, document.getElementById("root"));