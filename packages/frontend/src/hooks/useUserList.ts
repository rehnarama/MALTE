import * as React from "react";
import Socket from "../functions/Socket";
import { UserList } from "malte-common/dist/UserList";

export default function useUserList() {
  const [userList, setUserList] = React.useState<UserList>();

  React.useEffect(() => {
    function updateUserList(data: UserList) {
      setUserList(data);
    }
    const socket = Socket.getInstance().getSocket();
    socket.on("user/list", updateUserList);

    return () => {
      socket.removeListener("user/list", updateUserList);
    };
  });

  return userList;
}
