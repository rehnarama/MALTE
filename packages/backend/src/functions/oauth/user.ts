import { User } from "malte-common/dist/oauth/GitHub";
import { isUser } from "malte-common/dist/oauth/isUser";
import Database from "../db/Database";
import SocketServer from "../socketServer/SocketServer";
import GitHub from "./GitHub";

export async function updateUser(user: User): Promise<void> {
  const collection = Database.getInstance()
    .getDb()
    .collection("users");

  if (!(await collection.findOne({ id: user.id }))) {
    collection.insertOne({ ...user, active: true });
  }
}

export async function existUser(user: User): Promise<boolean> {
  const collection = Database.getInstance()
    .getDb()
    .collection("users");

  if (await collection.findOne({ id: user.id })) {
    return true;
  }
  return false;
}

export async function getUserFromId(id: number): Promise<User | undefined> {
  const collection = Database.getInstance()
    .getDb()
    .collection("users");

  const user = await collection.findOne({ id });

  if (isUser(user)) {
    return user;
  } else {
    return undefined;
  }
}

export async function removeUser(u: User): Promise<void> {
  const collectionUsers = Database.getInstance()
    .getDb()
    .collection("users");

  try {
    const user = await collectionUsers.findOne({ login: u.login });
    SocketServer.getInstance().removeUser(user);
  } catch (e) {
    console.log(e);
  }
}
