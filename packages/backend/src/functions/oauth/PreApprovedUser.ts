import Database from "../db/Database";

export async function addPreApproved(login: string): Promise<void> {
  const collection = Database.getInstance()
    .getDb()
    .collection("preapproved");
  if (!(await collection.findOne({ login: login }))) {
    collection.insertOne({ login: login });
  }
}

export async function removePreApproved(login: string): Promise<void> {
  const collection = Database.getInstance()
    .getDb()
    .collection("preapproved");
  collection.deleteOne({ login: login });
}

export async function getAllPreapproved(): Promise<string[]> {
  const collection = Database.getInstance()
    .getDb()
    .collection("preapproved");
  const preApprovedUsers = await collection.find().toArray();
  return preApprovedUsers.map(user => user.login);
}
