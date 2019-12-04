import * as React from "react";
import classes from "./TopBar.module.css";
import UserButton from "../UserButton";

const TopBar: React.FC<{ fileName: string }> = (props: {
  fileName: string;
}) => {
  const actualFileName = props.fileName.split(/\\|\//g).pop() || props.fileName;

  return (
    <header className={classes.container}>
      <div className={classes.tabBar}>
        <p className={classes.fileName}>{actualFileName}</p>
      </div>
      <div className={classes.rightSide}>
        <UserButton />
      </div>
    </header>
  );
};
export default TopBar;
