import * as React from "react";
import classes from "./TopBar.module.css";
import UserButton from "../UserButton";

const TopBar: React.SFC = () => {
  return (
    <header className={classes.container}>
      <div className={classes.rightSide}>
        <UserButton />
      </div>
    </header>
  );
};
export default TopBar;
