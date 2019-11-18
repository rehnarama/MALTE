import * as React from "react";
import { Terminal as XTerm } from "xterm";
import "xterm/css/xterm.css";
import Socket from "../functions/Socket";

const Terminal: React.FC = () => {
  
  const terminalRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (terminalRef.current !== null) {
      const terminal = new XTerm();
      terminal.open(terminalRef.current);

      const s = Socket.getInstance();
      terminal.onData(data => {
        s.getSocket().emit("pty-data", data);
      })

      s.getSocket().on("pty-data", (data: string) => {
        terminal.write(data);
      });
    }
  }, [terminalRef.current])


  return (
    <div ref={terminalRef}></div>
  );
};

export default Terminal;
