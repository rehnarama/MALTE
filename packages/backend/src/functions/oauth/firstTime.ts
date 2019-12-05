import Database from "../db/Database";

export async function isFirstTime(): Promise<boolean> {
  const collection = Database.getInstance()
    .getDb()
    .collection("config");

  if (await collection.findOne({ firstTime: true })) {
    return true;
  }
  return false;
}

export async function unsetFirstTime(): Promise<void> {
  const collection = Database.getInstance()
    .getDb()
    .collection("config");

  await collection.updateOne(
    { firstTime: true },
    { $set: { firstTime: false } }
  );
}
