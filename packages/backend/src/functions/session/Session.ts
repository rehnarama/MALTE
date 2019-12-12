import Database from "../db/Database";
import { Collection } from "mongodb";

// One day in seconds
const SESSION_EXPIRATION_SECONDS = 1 * 24 * 60 * 60;

export interface Session {
  userId: string;
  id: number;
  lastSeen: Date;
}

function getCollection(): Collection<Session> {
  const collection = Database.getInstance()
    .getDb()
    .collection<Session>("sessions");

  collection.createIndex(
    { lastSeen: 1 },
    {
      expireAfterSeconds: SESSION_EXPIRATION_SECONDS
    }
  );
  collection.createIndex({ userId: 1 });
  collection.createIndex({ id: 1 });

  return collection;
}

export async function getSession(userId: string): Promise<Session[]> {
  const collection = getCollection();

  const sessions = await collection
    .find({
      userId
    })
    .toArray();

  return sessions;
}

export async function getUserSessions(id: number): Promise<Session[]> {
  const collection = getCollection();

  const sessions = await collection
    .find({
      id
    })
    .toArray();

  return sessions;
}

export async function removeSession(
  userId: string
): Promise<number | undefined> {
  const collection = getCollection();

  const res = await collection.deleteMany({
    userId
  });

  return res.deletedCount;
}

export async function updateSessionTimestamp(userId: string): Promise<void> {
  const collection = getCollection();

  await collection.updateMany(
    {
      userId
    },
    {
      $set: {
        lastSeen: new Date()
      }
    }
  );
}

export async function addSession(userId: string, id: number): Promise<void> {
  const collection = getCollection();

  await collection.insertOne({
    userId,
    id,
    lastSeen: new Date()
  });
}
