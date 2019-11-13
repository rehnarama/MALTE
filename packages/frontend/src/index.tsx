import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { Terminal } from "xterm";
import "xterm/css/xterm.css"


const terminal = new Terminal();
var terminalNode = document.getElementById("terminal");
if (terminalNode !== null) {
  terminal.open(terminalNode);
  terminal.write("Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ");
}

ReactDOM.render(<App />, document.getElementById("root"));
