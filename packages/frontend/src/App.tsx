import * as React from "react";
import SideBar from "./SideBar";
import Terminal from "./Terminal";
import CodeEditor from "./CodeEditor";
import classes from "./App.module.css";

const App: React.FC = () => {
  return (
    <div className={classes.gridContainer}>
      <div className={classes.item1}><SideBar/ ></div>
      <div className={classes.item2}><CodeEditor/ ></div>
      <div className={classes.item3}><Terminal/ ></div>
    </div>
  );
}

export default App;