import * as React from "react";
import classes from "./TopBar.module.css";
import useUserList from "../../hooks/useUserList";
import Avatar from "../Avatar";
import { useFileNameContext } from "../../context/FileNameContext";
import CloseIcon from "@material-ui/icons/Close";

const TopBar: React.FC = () => {
  const {
    activeFileName,
    fileNames,
    changeActiveFileName,
    removeFile
  } = useFileNameContext();
  const userList = useUserList();

  const actualActiveFileName =
    activeFileName !== null ? activeFileName.split(/\\|\//g).pop() : null;

  const welcomeTab =
    actualActiveFileName === null ? (
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
        {userList &&
          userList.users.map(user => (
            <Avatar key={user.id} url={user.avatar_url} name={user.login} />
          ))}
      </div>
    </header>
  );
};
export default TopBar;
