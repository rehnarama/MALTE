import * as React from "react";

import SideBar from "./SideBar";
import Terminal from "./Terminal";
import TopBar from "./TopBar";
import CodeEditor from "./CodeEditor";
import classes from "./App.module.css";
import { DraggableCore, DraggableEventHandler } from "react-draggable";

const App: React.FC = () => {
  const [vsplit, setVSplit] = React.useState(300);
  const [hsplit, setHSplit] = React.useState(300);
  const [fileName, setFileName] = React.useState("");

  const onHDrag: DraggableEventHandler = (_, e) => {
    setHSplit(hsplit + e.deltaX);
  };
  const onVDrag: DraggableEventHandler = (_, e) => {
    // Negative since we drag terminal
    setVSplit(vsplit - e.deltaY);
  };

  return (
    <div
      className={classes.gridContainer}
      style={{
        gridTemplateColumns: `${hsplit}px min-content auto`,
        gridTemplateRows: `min-content auto min-content ${vsplit}px`
      }}
    >
      <div className={classes.topBar}>
        <TopBar fileName={fileName} />
      </div>
      <div className={classes.sidebar}>
        <SideBar fileName={fileName} setFileName={setFileName} />
      </div>
      <div className={classes.hresize}>
        <DraggableCore onDrag={onHDrag}>
          <div style={{ width: "5px", height: "100%", background: "#AAA" }} />
        </DraggableCore>
      </div>
      <div className={classes.texteditor}>
        <CodeEditor fileName={fileName} />
      </div>
      <div className={classes.vresize}>
        <DraggableCore onDrag={onVDrag}>
          <div style={{ height: "5px", width: "100%", background: "#AAA" }} />
        </DraggableCore>
      </div>
      <div className={classes.terminal}>
        <Terminal />
      </div>
    </div>
  );
};

export default App;
