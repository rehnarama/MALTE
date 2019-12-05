import * as React from "react";
import classes from "./TopBar.module.css";
import UserButton from "../UserButton";
import { useFileNameContext } from "../../context/FileNameContext";

const TopBar: React.FC = () => {
  const {
    activeFileName,
    fileNames,
    changeActiveFileName
  } = useFileNameContext();

  const actualActiveFileName =
    activeFileName.split(/\\|\//g).pop() || activeFileName;

  const welcomeTab =
    actualActiveFileName === "" ? (
      <p className={classes.fileName}>Welcome!</p>
    ) : null;

  return (
    <header className={classes.container}>
      <div className={classes.tabBar}>
        {fileNames.map((file: string) => {
          const actualFile = file.split(/\\|\//g).pop() || file;
          const fileClasses =
            actualFile === actualActiveFileName
              ? classes.activeFileName
              : classes.fileName;
          return (
            <p
              key={actualFile}
              className={fileClasses}
              onClick={() => changeActiveFileName(file)}
            >
              {actualFile}
            </p>
          );
        })}
        {welcomeTab}
      </div>
      <div className={classes.rightSide}>
        <UserButton />
      </div>
    </header>
  );
};
export default TopBar;
