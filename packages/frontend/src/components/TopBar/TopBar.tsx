import * as React from "react";
import classes from "./TopBar.module.css";
import UserButton from "../UserButton";
import useFilename from "../../hooks/useFilename";

const TopBar: React.SFC = () => {
  const fileName = useFilename();

  return (
    <header className={classes.container}>
      <div className={classes.tabBar}>
        <p className={classes.fileName}>{fileName}</p>
      </div>
      <div className={classes.rightSide}>
        <UserButton />
      </div>
    </header>
  );
};
export default TopBar;
