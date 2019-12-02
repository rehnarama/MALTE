import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./components/App";
import Monaco from "./functions/Monaco";

// Monaco needs to be initialized before anythin can run
const m = Monaco.getInstance();
m.initialize().then(() => {
  ReactDOM.render(<App />, document.getElementById("root"));
});
