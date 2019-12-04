import * as React from "react";
import Socket from "../functions/Socket";

export default function useUserList() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(
    Socket.isAuthenticated()
  );

  React.useEffect(() => {
    function onAuthenticated() {
      setIsAuthenticated(true);
    }
    const socket = Socket.getInstance().getSocket();
    socket.on("authenticated", onAuthenticated);

    return () => {
      socket.removeListener("authenticated", onAuthenticated);
    };
  });

  return isAuthenticated;
}
