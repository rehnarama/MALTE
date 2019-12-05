import * as React from "react";
import classes from "./TopBar.module.css";
import UserButton from "../UserButton";
import { useFileNameContext } from "../../context/FileNameContext";

const TopBar: React.FC = () => {
  const { fileName } = useFileNameContext();
  const actualFileName = fileName.split(/\\|\//g).pop() || fileName;

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
