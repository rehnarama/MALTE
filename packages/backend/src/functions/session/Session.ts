import Database from "../db/Database";

export interface Session {
  userId: string;
  socketId: string;
  id: number;
}

export async function getSessionFromUserId(userId: string): Promise<Session[]> {
  const collection = Database.getInstance()
    .getDb()
    .collection("sessions");

  const sessions = await collection
    .find({
      userId
    })
    .toArray();

  return sessions;
}

export async function removeSessionWithSocketId(
  socketId: string
): Promise<number | undefined> {
  const collection = Database.getInstance()
    .getDb()
    .collection("sessions");

  const res = await collection.deleteMany({
    socketId
  });

  return res.deletedCount;
}

export async function addSession(
  userId: string,
  socketId: string,
  id: number
): Promise<void> {
  const collection = Database.getInstance()
    .getDb()
    .collection("sessions");

  await collection.insertOne({
    userId,
    socketId,
    id
  });
}
