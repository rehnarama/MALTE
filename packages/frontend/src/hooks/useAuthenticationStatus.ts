import * as React from "react";
import Socket from "../functions/Socket";

export default function useAuthenticationStatus() {
  const [authenticationStatus, setAuthenticationStatus] = React.useState(
    Socket.isAuthenticated()
  );

  React.useEffect(() => {
    function onUpdate() {
      setAuthenticationStatus(Socket.isAuthenticated());
    }
    const socket = Socket.getInstance().getSocket();
    socket.on("connection/auth-confirm", onUpdate);
    socket.on("connection/auth-fail", onUpdate);

    return () => {
      socket.removeListener("connection/auth-confirm", onUpdate);
      socket.removeListener("connection/auth-fail", onUpdate);
    };
  });

  return authenticationStatus;
}
