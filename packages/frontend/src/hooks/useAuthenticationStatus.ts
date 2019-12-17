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
      socket.off("connection/auth-confirm", onUpdate);
      socket.off("connection/auth-fail", onUpdate);
      socket.off("connection/signout", onUpdate);
      socket.off("disconnect", onUpdate);
      socket.off("reconnect", onUpdate);
      socket.off("authorized/removed", onUpdate);
    };
  });

  return authenticationStatus;
}
