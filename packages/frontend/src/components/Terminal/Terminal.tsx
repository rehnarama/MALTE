import * as React from "react";
import { Terminal as XTerm } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import Socket from "../../functions/Socket";
import TerminalSize from "malte-common/dist/Terminal";
import ReactResizeDetector from "react-resize-detector";
import classes from "./Terminal.module.css";

let lastSizeSent: TerminalSize | null = null;
let socket: Socket;
let terminal: XTerm;
let fitAddon: FitAddon;
const Terminal: React.FC = () => {
  const terminalRef = React.useCallback(node => {
    function writeData(data: string) {
      terminal.write(data);
    }
    function dispose() {
      terminal.dispose();
      socket.getSocket().off("pty/data", writeData);
      socket.getSocket().off("connection/signout", dispose);
      socket.getSocket().off("disconnect", dispose);
      socket.getSocket().off("authorized/removed", dispose);
    }

    if (node !== null) {
      socket = Socket.getInstance();

      terminal = new XTerm();
      fitAddon = new FitAddon();
      terminal.loadAddon(fitAddon);
      terminal.open(node);
      fitAddon.fit();

      terminal.onData(data => {
        socket.getSocket().emit("pty/data", data);
      });

      socket.getSocket().on("pty/data", writeData);
      socket.getSocket().on("authorized/removed", dispose);
      socket.getSocket().on("connection/signout", dispose);
      socket.getSocket().on("disconnect", dispose);
    }
  }, []);

  function resizeTerminal() {
    const dim = fitAddon.proposeDimensions();
    if (
      !lastSizeSent ||
      dim.cols !== lastSizeSent.columns ||
      dim.rows !== lastSizeSent.rows
    ) {
      if (!lastSizeSent) {
        lastSizeSent = {
          columns: dim.cols,
          rows: dim.rows
        };
      }
      lastSizeSent.columns = dim.cols;
      lastSizeSent.rows = dim.rows;

      fitAddon.fit();

      socket.getSocket().emit("pty/resize", lastSizeSent);
    }
  }

  return (
    <div className={classes.container}>
      <ReactResizeDetector handleWidth handleHeight onResize={resizeTerminal} />
      <div ref={terminalRef} className={classes.terminal} />
    </div>
  );
};

export default Terminal;
