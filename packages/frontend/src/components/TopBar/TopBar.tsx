import * as React from "react";
import classes from "./TopBar.module.css";
import UserButton from "../UserButton";
import { useFileNameContext } from "../../context/FileNameContext";
import CloseIcon from "@material-ui/icons/Close";

const TopBar: React.FC = () => {
  const {
    activeFileName,
    fileNames,
    changeActiveFileName,
    removeFile
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
          const closeFile =
            actualFile === actualActiveFileName ? (
              <p className={classes.close} onClick={() => removeFile(file)}>
                <CloseIcon />
              </p>
            ) : null;
          return (
            <div
              key={actualFile}
              className={fileClasses}
              onClick={() => changeActiveFileName(file)}
            >
              {actualFile}
              {closeFile}
            </div>
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
