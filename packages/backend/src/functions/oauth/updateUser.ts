import { User } from "malte-common/dist/oauth/GitHub";
import Database from "../db/Database";

export async function updateUser(user: User): Promise<void> {
  const collection = Database.getInstance()
    .getDb()
    .collection("users");

  if (!(await collection.findOne({ id: user.id }))) {
    console.log("didn't find user");
    collection.insertOne({ ...user, active: true });
  }
  console.log("i think user is already in db so why bother?");
}
