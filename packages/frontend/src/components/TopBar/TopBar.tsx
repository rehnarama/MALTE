import * as React from "react";
import classes from "./TopBar.module.css";
import UserButton from "../UserButton";
import useFilename from "../../hooks/useFilename";
import useUserList from "../../hooks/useUserList";
import Avatar from "../Avatar";
import Socket from "../../functions/Socket";
import { useFileNameContext } from "../../context/FileNameContext";

const TopBar: React.FC = () => {
  const { fileName } = useFileNameContext();
  const userList = useUserList();
  const fileName = useFilename();
  const actualFileName = fileName.split(/\\|\//g).pop() || fileName;

  const isAuthenticated = Socket.isAuthenticated();

  return (
    <header className={classes.container}>
      <div className={classes.tabBar}>
        <p className={classes.fileName}>
          {actualFileName === "" ? "Welcome!" : actualFileName}
        </p>
      </div>
      <div className={classes.rightSide}>
        {isAuthenticated &&
          userList &&
          userList.users.map(user => (
            <Avatar key={user.id} url={user.avatarUrl} name={user.name} />
          ))}
        {!isAuthenticated && <UserButton />}
      </div>
    </header>
  );
};
export default TopBar;
