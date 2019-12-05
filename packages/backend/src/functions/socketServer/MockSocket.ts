/* eslint-disable */
import SocketIO from "socket.io";
import uuidv4 from "uuid/v4";
import MockSocketNamespace from "./MockSocketNamespace";
import MockSocketIoServer from "./MockSocketIoServer";

export default class MockSocket implements SocketIO.Socket {
  public onAny: (event: string | symbol, ...args: any[]) => void | undefined;

  constructor(server: MockSocketIoServer) {
    this.server = server;
    this.nsp = new MockSocketNamespace(server, {
      [this.id]: this
    });
  }

  on(event: string | symbol, listener: (...args: any[]) => void): this {
    this.nsp.on(event.toString(), listener);
    return this;
  }

  emit(event: string | symbol, ...args: any[]): boolean {
    if (this.onAny) {
      this.onAny(event, ...args);
    }
    return this.nsp.emit(event.toString(), ...args);
  }

  nsp: SocketIO.Namespace;
  server: SocketIO.Server;
  adapter: SocketIO.Adapter;
  id: string = uuidv4();
  request: any;
  client: SocketIO.Client;
  conn: SocketIO.EngineSocket;
  rooms: { [id: string]: string } = {};
  connected: boolean;
  disconnected: boolean;
  handshake: SocketIO.Handshake;
  json: SocketIO.Socket;
  volatile: SocketIO.Socket;
  broadcast: SocketIO.Socket;
  to(room: string): SocketIO.Socket {
    throw new Error("Method not implemented.");
  }
  in(room: string): SocketIO.Socket {
    throw new Error("Method not implemented.");
  }
  use(
    fn: (packet: SocketIO.Packet, next: (err?: any) => void) => void
  ): SocketIO.Socket {
    throw new Error("Method not implemented.");
  }
  send(...args: any[]): SocketIO.Socket {
    throw new Error("Method not implemented.");
  }
  write(...args: any[]): SocketIO.Socket {
    throw new Error("Method not implemented.");
  }
  join(name: string | string[], fn?: (err?: any) => void): SocketIO.Socket {
    if (typeof name === "string") {
      this.rooms[name] = "joined";
    } else {
      name.forEach(n => this.join(n, fn));
    }
    return this;
  }
  leave(name: string, fn?: Function): SocketIO.Socket {
    throw new Error("Method not implemented.");
  }
  leaveAll(): void {
    throw new Error("Method not implemented.");
  }
  disconnect(close?: boolean): SocketIO.Socket {
    throw new Error("Method not implemented.");
  }
  listeners(event: string): Function[] {
    throw new Error("Method not implemented.");
  }
  compress(compress: boolean): SocketIO.Socket {
    throw new Error("Method not implemented.");
  }
  error(err: any): void {
    throw new Error("Method not implemented.");
  }
  addListener(
    event: string | symbol,
    listener: (...args: any[]) => void
  ): this {
    throw new Error("Method not implemented.");
  }
  once(event: string | symbol, listener: (...args: any[]) => void): this {
    throw new Error("Method not implemented.");
  }
  removeListener(
    event: string | symbol,
    listener: (...args: any[]) => void
  ): this {
    throw new Error("Method not implemented.");
  }
  off(event: string | symbol, listener: (...args: any[]) => void): this {
    throw new Error("Method not implemented.");
  }
  removeAllListeners(event?: string | symbol): this {
    throw new Error("Method not implemented.");
  }
  setMaxListeners(n: number): this {
    throw new Error("Method not implemented.");
  }
  getMaxListeners(): number {
    throw new Error("Method not implemented.");
  }
  rawListeners(event: string | symbol): Function[] {
    throw new Error("Method not implemented.");
  }
  listenerCount(type: string | symbol): number {
    throw new Error("Method not implemented.");
  }
  prependListener(
    event: string | symbol,
    listener: (...args: any[]) => void
  ): this {
    throw new Error("Method not implemented.");
  }
  prependOnceListener(
    event: string | symbol,
    listener: (...args: any[]) => void
  ): this {
    throw new Error("Method not implemented.");
  }
  eventNames(): (string | symbol)[] {
    throw new Error("Method not implemented.");
  }
}
