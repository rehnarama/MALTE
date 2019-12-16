import io from "socket.io-client";

// Adaptation from
// https://medium.com/free-code-camp/testing-socket-io-client-app-using-jest-and-react-testing-library-9cae93c070a3

let CLIENT_LISTENERS: any = {};
let SERVER_LISTENERS: any = {};

function clientEmit(event: string, ...args: any): SocketIOClient.Socket {
  if (SERVER_LISTENERS[event]) {
    SERVER_LISTENERS[event].forEach((func: Function) => func(...args));
  }
  return socket;
}

function serverEmit(event: string, ...args: any): SocketIOClient.Socket {
  CLIENT_LISTENERS[event].forEach((func: Function) => func(...args));
  return socket;
}

export const socket: SocketIOClient.Socket = {
  on(event: string, func: Function): SocketIOClient.Socket {
    if (CLIENT_LISTENERS[event]) {
      return CLIENT_LISTENERS[event].push(func);
    }
    CLIENT_LISTENERS[event] = [func];
    return socket;
  },
  emit: clientEmit,
  id: "",
  connected: true,
  disconnected: false,
  open: () => socket,
  connect: () => socket,
  send: () => socket,
  compress: (b: boolean) => socket,
  close: () => socket,
  disconnect: () => socket,
  io: new io.Manager(""),
  nsp: "",
  once: (e: any, fn: any): any => {},
  addEventListener: (e: any, fn: any): any => {},
  removeListener: (e: any, fn: any): any => {},
  removeEventListener: (e: any, fn: any): any => {},
  off: (e: any, fn: any): any => {},
  removeAllListeners: (): any => {},
  listeners: (e: string) => [],
  hasListeners: (e: string) => {
    return CLIENT_LISTENERS[e] !== undefined;
  }
};

// Additional helpers, not included in the real socket.io-client,just for out test.
// to emulate server emit.
export const serverSocket = {
  on(event: string, func: Function): SocketIOClient.Socket {
    if (SERVER_LISTENERS[event]) {
      return SERVER_LISTENERS[event].push(func);
    }
    SERVER_LISTENERS[event] = [func];
    return socket;
  },
  emit: serverEmit
};

// cleanup helper
export function cleanup() {
  CLIENT_LISTENERS = {};
  SERVER_LISTENERS = {};
}

jest.mock("socket.io-client");
const ioMock = (io as unknown) as jest.Mock<SocketIOClient.Socket>;
ioMock.mockImplementation((...args) => {
  return socket;
});

