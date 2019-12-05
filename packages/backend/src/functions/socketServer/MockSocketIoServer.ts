/* eslint-disable */
import SocketIO from "socket.io";
import MockSocket from "./MockSocket";

export default class MockSocketIoServer implements SocketIO.Server {
  private mockSockets: MockSocket[] = [];
  private eventFnMap = new Map<string, Function[]>();

  public addMockSocket(socket: MockSocket) {
    this.mockSockets.push(socket);
    socket.onAny = (event: string, ...args: any[]) => {
      const fns = this.eventFnMap.get(event);
      if (fns) {
        fns.forEach(fn => fn(...args));
      }
    };

    // Call functions
    const connectionFns = this.eventFnMap.get("connection");
    if (connectionFns) {
      connectionFns.forEach(fn => fn(socket));
    }
  }

  engine: { ws: any };
  nsps: { [namespace: string]: SocketIO.Namespace };
  sockets: SocketIO.Namespace;
  json: SocketIO.Server;
  volatile: SocketIO.Server;
  local: SocketIO.Server;
  checkRequest(req: any, fn: (err: any, success: boolean) => void): void {
    throw new Error("Method not implemented.");
  }
  serveClient(): boolean;
  serveClient(v: boolean): SocketIO.Server;
  serveClient(v?: any): boolean | SocketIO.Server {
    throw new Error("Method not implemented.");
  }
  path(): string;
  path(v: string): SocketIO.Server;
  path(v?: any): string | SocketIO.Server {
    throw new Error("Method not implemented.");
  }
  adapter(): undefined;
  adapter(v: any): SocketIO.Server;
  adapter(v?: any): SocketIO.Server | undefined {
    throw new Error("Method not implemented.");
  }
  origins(): string | string[];
  origins(v: string | string[]): SocketIO.Server;
  origins(
    fn: (
      origin: string,
      callback: (error: string, success: boolean) => void
    ) => void
  ): SocketIO.Server;
  origins(fn?: any): string | string[] | SocketIO.Server {
    throw new Error("Method not implemented.");
  }
  attach(srv: any, opts?: SocketIO.ServerOptions): SocketIO.Server;
  attach(port: number, opts?: SocketIO.ServerOptions): SocketIO.Server;
  attach(port: any, opts?: any): SocketIO.Server {
    throw new Error("Method not implemented.");
  }
  listen(srv: any, opts?: SocketIO.ServerOptions): SocketIO.Server;
  listen(port: number, opts?: SocketIO.ServerOptions): SocketIO.Server;
  listen(port: any, opts?: any): SocketIO.Server {
    throw new Error("Method not implemented.");
  }
  bind(srv: any): SocketIO.Server {
    throw new Error("Method not implemented.");
  }
  onconnection(socket: any): SocketIO.Server {
    throw new Error("Method not implemented.");
  }
  of(nsp: string | Function | RegExp): SocketIO.Namespace {
    throw new Error("Method not implemented.");
  }
  close(fn?: () => void): void {
    throw new Error("Method not implemented.");
  }
  on(
    event: "connection",
    listener: (socket: SocketIO.Socket) => void
  ): SocketIO.Namespace;
  on(
    event: "connect",
    listener: (socket: SocketIO.Socket) => void
  ): SocketIO.Namespace;
  on(event: string, listener: Function): SocketIO.Namespace;
  on(event: any, listener: any): SocketIO.Namespace {
    let fns = this.eventFnMap.get(event);
    if (!fns) {
      fns = [];
      this.eventFnMap.set(event, fns);
    }
    fns.push(listener);
    return null;
  }
  to(room: string): SocketIO.Namespace {
    throw new Error("Method not implemented.");
  }
  in(room: string): SocketIO.Namespace {
    throw new Error("Method not implemented.");
  }
  use(
    fn: (socket: SocketIO.Socket, fn: (err?: any) => void) => void
  ): SocketIO.Namespace {
    throw new Error("Method not implemented.");
  }
  emit(event: string, ...args: any[]): SocketIO.Namespace {
    for (const socket of this.mockSockets) {
      socket.emit(event, ...args);
    }
    return this.sockets;
  }
  send(...args: any[]): SocketIO.Namespace {
    throw new Error("Method not implemented.");
  }
  write(...args: any[]): SocketIO.Namespace {
    throw new Error("Method not implemented.");
  }
  clients(...args: any[]): SocketIO.Namespace {
    throw new Error("Method not implemented.");
  }
  compress(...args: any[]): SocketIO.Namespace {
    throw new Error("Method not implemented.");
  }
}
