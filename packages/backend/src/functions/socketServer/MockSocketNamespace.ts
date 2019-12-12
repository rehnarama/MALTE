/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import SocketIO from "socket.io";
import MockSocketIoServer from "./MockSocketIoServer";

export default class MockSocketNamespace implements SocketIO.Namespace {
  private eventFnMap = new Map<string | symbol, Function[]>();
  public onAny: (event: string | symbol, ...args: any[]) => void | undefined;

  constructor(
    server: MockSocketIoServer,
    sockets: { [id: string]: SocketIO.Socket }
  ) {
    this.server = server;
    this.sockets = sockets;
  }

  on(event: string | symbol, listener: (...args: any[]) => void): this {
    let fns = this.eventFnMap.get(event);
    if (!fns) {
      fns = [];
      this.eventFnMap.set(event, fns);
    }
    fns.push(listener);
    return this;
  }

  emit(event: string | symbol, ...args: any[]): boolean {
    if (this.onAny) {
      this.onAny(event, ...args);
    }

    const fns = this.eventFnMap.get(event);
    if (fns) {
      fns.forEach(fn => fn(...args));
    }

    return true;
  }
  name: string;
  server: SocketIO.Server;
  sockets: { [id: string]: SocketIO.Socket };
  connected: { [id: string]: SocketIO.Socket };
  adapter: SocketIO.Adapter;
  json: SocketIO.Namespace;
  use(
    fn: (socket: SocketIO.Socket, fn: (err?: any) => void) => void
  ): SocketIO.Namespace {
    throw new Error("Method not implemented.");
  }
  to(room: string): SocketIO.Namespace {
    throw new Error("Method not implemented.");
  }
  in(room: string): SocketIO.Namespace {
    throw new Error("Method not implemented.");
  }
  send(...args: any[]): SocketIO.Namespace {
    throw new Error("Method not implemented.");
  }
  write(...args: any[]): SocketIO.Namespace {
    throw new Error("Method not implemented.");
  }
  clients(fn: Function): SocketIO.Namespace {
    throw new Error("Method not implemented.");
  }
  compress(compress: boolean): SocketIO.Namespace {
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
  listeners(event: string | symbol): Function[] {
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
