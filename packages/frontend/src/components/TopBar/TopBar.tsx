import * as React from "react";
import classes from "./TopBar.module.css";
import UserButton from "../UserButton";

interface Props {
  currentFile: string;
}

const TopBar: React.SFC<Props> = ({ currentFile }) => {
  return (
    <header className={classes.container}>
      <div className={classes.tabBar}>
        <p className={classes.fileName}>{currentFile}</p>
      </div>
      <div className={classes.rightSide}>
        <UserButton />
      </div>
    </header>
  );
};
export default TopBar;
