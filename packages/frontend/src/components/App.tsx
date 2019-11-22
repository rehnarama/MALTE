import * as React from "react";

import SideBar from "./SideBar";
import Terminal from "./Terminal";
import TopBar from "./TopBar";
import CodeEditor from "./CodeEditor";
import classes from "./App.module.css";

const App: React.FC = () => {
  return (
    <div className={classes.gridContainer}>
      <div className={classes.topBar}>
        <TopBar />
      </div>
      <div className={classes.sidebar}>
        <SideBar />
      </div>
      <div className={classes.texteditor}>
        <CodeEditor />
      </div>
      <div className={classes.terminal}>
        <Terminal />
      </div>
    </div>
  );
};

export default App;
