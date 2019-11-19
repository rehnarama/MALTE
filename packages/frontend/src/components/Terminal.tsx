import * as React from "react";
import { Terminal as XTerm } from "xterm";
import "xterm/css/xterm.css";
import Socket from "../functions/Socket";

const Terminal: React.FC = () => {
  const terminalRef = React.useCallback(node => {
    if (node !== null) {
      const terminal = new XTerm();
      terminal.open(node);

      const s = Socket.getInstance();
      terminal.onData(data => {
        s.getSocket().emit("pty-data", data);
      });

      s.getSocket().on("pty-data", (data: string) => {
        terminal.write(data);
      });
    }
  }, []);

  return <div ref={terminalRef}></div>;
};

export default Terminal;

/*

      const terminal = new XTerm();
      terminal.open(node);

      const s = Socket.getInstance();
      terminal.onData(data => {
        s.getSocket().emit("pty-data", data);
      });
      s.getSocket().on("pty-data", (data: string) => {
        terminal.write(data));

        */