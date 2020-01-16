import * as React from "react";
import { useEffect } from "react";
import addsvg from "./add.svg";
import deletesvg from "./delete.svg";
import Avatar from "../Avatar";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import classes from "./AddButton.module.css";
import { Button, Input, DialogContent } from "@material-ui/core";
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

    return () => {
      socket.off("authorized/list");
    };
  }, [users, socket]);

  useEffect(() => {
    socket.emit("authorized/fetch");

    return () => {
      socket.off("authorized/fetch");
    };
  }, [open, socket]);

  const handleFileNameChange = React.useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >(e => {
    setUserName(e.currentTarget.value);
  }, []);

  const addUser = React.useCallback(() => {
    // This function will call backend
    if (userName && !users.includes(userName)) {
      setUserName("");
      socket.emit("authorized/add", { login: userName });
    }
  }, [users, userName, socket, setUserName]);

  const handleKeyDown = React.useCallback<React.KeyboardEventHandler>(
    e => {
      if (e.key === "Enter") {
        addUser();
      } else if (e.key === "Escape") {
        e.stopPropagation();
        setUserName("");
      }
    },
    [addUser]
  );

  const onSelect = () => {
    setOpen(true);
  };

  const removeUser = (userName: string) => {
    // This function will call backend
    if (userName) {
      setUserName("");
      socket.emit("authorized/remove", { login: userName });
    }
  };

  const allowAll = React.useCallback(() => {
    socket.emit("authorized/allow-all");
  }, [socket]);

  return (
    <>
      <Dialog
        onClose={() => setOpen(false)}
        aria-labelledby="simple-dialog-title"
        open={open}
      >
        <DialogTitle id="simple-dialog-title">Collaborators</DialogTitle>
        <DialogContent>
          <div className={classes.collaboratorList}>
            {users.length > 0 ? (
              <ul>
                {users.map(collaborator => (
                  <li key={collaborator}>
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
          <Input
            type="text"
            autoFocus
            placeholder="Enter username"
            onKeyDown={handleKeyDown}
            onChange={handleFileNameChange}
            value={userName}
            fullWidth
            disableUnderline
          />
          <Button fullWidth onClick={addUser} variant={"outlined"}>
            Add User
          </Button>
          <Button fullWidth onClick={() => setOpen(false)}>
            Close
          </Button>
          <Button fullWidth onClick={allowAll}>
            Allow all
          </Button>
        </DialogContent>
      </Dialog>
      <Avatar
        url={addsvg}
        name={"Add User"}
        onSelect={onSelect}
        className={classes.addButton}
      />
    </>
  );
};
export default AddButton;
