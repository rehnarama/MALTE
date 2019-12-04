import express from "express";
import cookieParser from "cookie-parser";
import socketio from "socket.io";
import fsTree from "./functions/fsTree";
import Project from "./functions/Project";
import cors from "cors";
import Terminal from "./functions/terminal/Terminal";
import GitHub from "./functions/oauth/GitHub";
import { FileSystem } from "./functions/filesystem";
import { initializeWorkspaceInUserHome } from "./functions/workspace/initializeWorkspaceInUserHome";
import { initializeRandomDirectory } from "./functions/workspace/initializeRandomDirectory";
import { forceSsl } from "./functions/forceSsl/forceSsl";
import Database from "./functions/db/Database";

const PORT = Number.parseInt(process.env.PORT) || 4000;
let frontendUrl = "http://localhost:3000";
if (process.env.REACT_APP_FRONTEND_URL) {
  frontendUrl = process.env.REACT_APP_FRONTEND_URL;
}

async function start(): Promise<void> {
  await Database.getInstance().connect();

  let projectRoot;
  if (process.env.PROJECT_DIRECTORY) {
    projectRoot = await initializeWorkspaceInUserHome();
  } else {
    projectRoot = await initializeRandomDirectory();
  }

  const project = new Project(projectRoot);
  await project.initialize();

  const app = express();
  app.use(cookieParser());
  if (process.env.NODE_ENV === "production") {
    app.use("/", forceSsl, express.static("public_frontend"));
  } else {
    app.use("/", express.static("public_frontend"));
  }

  const whitelist = [frontendUrl];
  const corsOptions = {
    origin: function(
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ): void {
      // origin is undefined if same origin or server-2-server
      if (!origin || whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  };
  app.use(cors(corsOptions));

  const gitHub = new GitHub(app);

  const server = app.listen(PORT, err => {
    if (err) {
      return console.error(err);
    }
    return console.log(`Server is listening on ${PORT}`);
  });

  // For some reason, socket.io refuses to work on heroku unless all
  // ports are allowed, so let's make it so!
  const origins = frontendUrl.replace(/:\d+$/, "") + ":*";
  const io = socketio(server, { origins });
  io.on("connection", async socket => {
    console.log(`Socket with id ${socket.id} connected`);

    new Terminal(socket, projectRoot);
    new FileSystem(socket, projectRoot);
    project.join(socket);

    // send file tree on request from client
    socket.on("refresh-file-tree", async () => {
      if (socket.rooms["authenticated"]) {
        socket.emit("file-tree", await fsTree(projectRoot));
      }
    });

    // everyone must be able to request to join, otherwise noone can join
    socket.on("join-group", async userId => {
      const response = await gitHub.getUser(userId);
      if (response === "needs_auth" || response === "unknown_error") {
        console.log("Unknown user trying to connect");
      } else {
        console.log("User connected to auth group");
        socket.join("authenticated");
        // emit filetree here can be removed later when we have login in separate window
        socket.emit("file-tree", await fsTree(projectRoot));
      }
    });
  });

  // broadcast file tree when filesystem changes
  project.getWatcher().on("all", async () => {
    const tree = await fsTree(projectRoot);
    io.to("authenticated").emit("file-tree", tree);
  });
}

start();
