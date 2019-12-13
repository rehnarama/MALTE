import * as React from "react";
import Socket from "../functions/Socket";

export default function useAuthenticationStatus() {
  const [authenticationStatus, setAuthenticationStatus] = React.useState(
    Socket.getAuthenticationStatus()
  );

  React.useEffect(() => {
    function onUpdate() {
      setAuthenticationStatus(Socket.getAuthenticationStatus());
    }

    const socket = Socket.getInstance().getSocket();
    socket.on("connection/auth-confirm", onUpdate);
    socket.on("connection/auth-fail", onUpdate);
    socket.on("connection/signout", onUpdate);
    socket.on("disconnect", onUpdate);
    socket.on("reconnect", onUpdate);
    socket.on("authorized/removed", onUpdate);

    return () => {
      socket.removeListener("connection/auth-confirm", onUpdate);
      socket.removeListener("connection/auth-fail", onUpdate);
      socket.removeListener("connection/signout", onUpdate);
    };
  });

  return authenticationStatus;
}
