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
    socket.on("connection/auth-confirm", onAuthenticated);

    return () => {
      socket.removeListener("connection/auth-confirm", onAuthenticated);
    };
  });

  return isAuthenticated;
}
