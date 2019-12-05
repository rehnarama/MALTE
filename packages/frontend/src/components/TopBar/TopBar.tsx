import * as React from "react";
import classes from "./TopBar.module.css";
import useUserList from "../../hooks/useUserList";
import Avatar from "../Avatar";
import { useFileNameContext } from "../../context/FileNameContext";

const TopBar: React.FC = () => {
  const { fileName } = useFileNameContext();
  const userList = useUserList();

  const actualFileName = fileName.split(/\\|\//g).pop() || fileName;

  return (
    <header className={classes.container}>
      <div className={classes.tabBar}>
        <p className={classes.fileName}>
          {actualFileName === "" ? "Welcome!" : actualFileName}
        </p>
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
