import * as React from "react";
import Socket from "../functions/Socket";

export default function useFilename() {
  const [fileName, setFileName] = React.useState("");

  React.useEffect(() => {
    function updateFileName(data: { path: string }) {
      setFileName(data.path);
    }
    const socket = Socket.getInstance().getSocket();
    socket.on("open-buffer", updateFileName);

    return () => {
      socket.removeListener("open-buffer", updateFileName);
    };
  });

  return fileName;
}
