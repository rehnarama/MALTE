import * as React from "react";
import SideBar from "../SideBar";
import Terminal from "../Terminal";
import TopBar from "../TopBar";
import CodeEditor from "../CodeEditor";
import classes from "./Main.module.css";
import { DraggableCore, DraggableEventHandler } from "react-draggable";
import BottomBar from "../BottomBar";
import Socket from "../../functions/Socket";
import { useCookies } from "react-cookie";

const Main: React.FC = () => {
  const [vsplit, setVSplit] = React.useState(300);
  const [hsplit, setHSplit] = React.useState(300);
  const [darkTheme, setDarkTheme] = React.useState(false);
  const [cookies] = useCookies(["userId"]);

  const onHDrag: DraggableEventHandler = (_, e) => {
    setHSplit(hsplit + e.deltaX);
  };
  const onVDrag: DraggableEventHandler = (_, e) => {
    // Negative since we drag terminal
    setVSplit(vsplit - e.deltaY);
  };
  const toggleDarkTheme = () => {
    setDarkTheme(!darkTheme);
  };
  const signOut = () => {
    if (cookies.userId) {
      Socket.getInstance()
        .getSocket()
        .emit("connection/signout", cookies.userId);
    }
  };

  return (
    <div>
      <div
        className={classes.gridContainer}
        style={{
          gridTemplateColumns: `${hsplit}px min-content auto`,
          gridTemplateRows: `min-content auto min-content ${vsplit}px`
        }}
      >
        <div className={classes.topBar}>
          <TopBar />
        </div>
        <div className={classes.sidebar}>
          <SideBar signOut={signOut} />
        </div>
        <div className={classes.hresize}>
          <DraggableCore onDrag={onHDrag}>
            <div style={{ width: "5px", height: "100%", background: "#AAA" }} />
          </DraggableCore>
        </div>
        <div className={classes.texteditor}>
          <CodeEditor darkTheme={darkTheme} />
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
      <div className={classes.bottomBar}>
        <BottomBar switchTheme={toggleDarkTheme} />
      </div>
    </div>
  );
};

export default Main;
