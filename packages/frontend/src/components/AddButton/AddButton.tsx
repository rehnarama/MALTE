import * as React from "react";
import { useEffect } from "react";
import addsvg from "./add.svg";
import deletesvg from "./delete.svg";
import Avatar from "../Avatar";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import classes from "./AddButton.module.css";
import { Button } from "@material-ui/core";
import Socket from "../../functions/Socket";

const AddButton: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const [users, setUsers] = React.useState<string[]>([]);
  const [userName, setUserName] = React.useState("");
  const socket = Socket.getInstance().getSocket();

  useEffect(() => {
    socket.on("authorized/list", (userList: string[]) => {
      setUsers(userList);
    });
  }, [users]);

  useEffect(() => {
    socket.emit("authorized/fetch");
  }, [open]);

  const handleFileNameChange = React.useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >(e => {
    setUserName(e.currentTarget.value);
  }, []);

  const handleKeyDown = React.useCallback<React.KeyboardEventHandler>(
    e => {
      if (e.key === "Enter") {
        addUser();
        console.log(userName);
      } else if (e.key === "Escape") {
        e.stopPropagation();
        setUserName("");
      }
    },
    [userName]
  );

  const onSelect = () => {
    setOpen(true);
  };

  const addUser = () => {
    // This function will call backend
    if (userName && !users.includes(userName)) {
      setUsers(users.concat(userName));
      setUserName("");
      socket.emit("authorized/add", { login: userName });
    }
  };

  const removeUser = (userName: string) => {
    // This function will call backend
    if (userName) {
      setUsers(users.filter(e => e !== userName));
      setUserName("");
      socket.emit("authorized/remove", { login: userName });
    }
  };

  return (
    <>
      <Dialog
        onClose={() => setOpen(false)}
        aria-labelledby="simple-dialog-title"
        open={open}
      >
        <DialogTitle id="simple-dialog-title">Collaborators</DialogTitle>
        <div className={classes.collaboratorList}>
          {users.length > 0 ? (
            <ul>
              {users.map(collaborator => (
                <li>
                  {collaborator}
                  <img
                    key="delete"
                    src={deletesvg}
                    onClick={() => removeUser(collaborator)}
                    alt="Delete"
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p>No users</p>
          )}
        </div>
        <input
          type="text"
          autoFocus
          placeholder="Enter username"
          onKeyDown={handleKeyDown}
          onChange={handleFileNameChange}
          value={userName}
        />
        <Button onClick={addUser}>Add User</Button>
        <Button fullWidth variant={"outlined"} onClick={() => setOpen(false)}>
          Close
        </Button>
      </Dialog>
      <Avatar url={addsvg} name={"Add User"} onSelect={onSelect} />
    </>
  );
};
export default AddButton;
