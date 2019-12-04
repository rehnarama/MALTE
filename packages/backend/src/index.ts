import express from "express";
import cookieParser from "cookie-parser";
import fsTree from "./functions/fsTree";
import Project from "./functions/Project";
import cors from "cors";
import GitHub from "./functions/oauth/GitHub";
import { initializeWorkspaceInUserHome } from "./functions/workspace/initializeWorkspaceInUserHome";
import { initializeRandomDirectory } from "./functions/workspace/initializeRandomDirectory";
import { forceSsl } from "./functions/forceSsl/forceSsl";
import Database from "./functions/db/Database";
import SocketServer from "./functions/socketServer/SocketServer";

const PORT = Number.parseInt(process.env.PORT) || 4000;
let frontendUrl = "http://localhost:3000";
if (process.env.REACT_APP_FRONTEND_URL) {
  frontendUrl = process.env.REACT_APP_FRONTEND_URL;
}

async function start(): Promise<void> {
  await Database.getInstance().connect();

  let projectRoot: string;
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

  GitHub.initialize(app);

  const server = app.listen(PORT, err => {
    if (err) {
      return console.error(err);
    }
    return console.log(`Server is listening on ${PORT}`);
  });

  // For some reason, socket.io refuses to work on heroku unless all
  // ports are allowed, so let's make it so!
  const origins = frontendUrl.replace(/:\d+$/, "") + ":*";

  SocketServer.initialize(server, origins, project);
  const io = SocketServer.getInstance().server;

  // broadcast file tree when filesystem changes
  project.getWatcher().on("all", async () => {
    const tree = await fsTree(projectRoot);
    io.to("authenticated").emit("file-tree", tree);
  });
}

start();
