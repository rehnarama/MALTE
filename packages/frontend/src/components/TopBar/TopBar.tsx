import * as React from "react";
import classes from "./TopBar.module.css";
import UserButton from "../UserButton";

const TopBar: React.SFC = () => {
  return (
    <header className={classes.container}>
      <h1 className={classes.title}>MALTE</h1>
      <div className={classes.rightSide}>
        <UserButton />
      </div>
    </header>
  );
};
export default TopBar;
