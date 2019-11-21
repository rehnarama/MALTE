import * as React from "react";
import { Terminal as XTerm } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";

import Socket from "../functions/Socket";

const Terminal: React.FC = () => {
  const terminalRef = React.useCallback(node => {
    if (node !== null) {
      const s = Socket.getInstance();

      const terminal = new XTerm();
      const fitAddon = new FitAddon();
      terminal.loadAddon(fitAddon);
      terminal.open(node);
      fitAddon.fit();
      // Send dimension info to server
      s.getSocket().emit("resize-pty", fitAddon.proposeDimensions());
      // TODO: watch container size and resize when needed

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
