import { User } from "malte-common/dist/oauth/GitHub";
import Database from "../db/Database";

export async function updateUser(user: User): Promise<void> {
  const collection = Database.getInstance()
    .getDb()
    .collection("users");

  if (!(await collection.findOne({ id: user.id }))) {
    collection.insertOne({ ...user, active: true });
  }
}
