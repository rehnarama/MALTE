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
  collection.createIndex({ userId: 1 }, { unique: true });
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

export async function removeSession(userId: string): Promise<void> {
  const collection = getCollection();

  await collection.deleteOne({
    userId
  });
}

export async function updateSessionTimestamp(userId: string): Promise<void> {
  const collection = getCollection();

  await collection.updateOne(
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

  try {
    await collection.insertOne({
      userId,
      id,
      lastSeen: new Date()
    });
  } catch (e) {
    const isDuplicateSession = e?.code === 11000;
    if (!isDuplicateSession) {
      // Duplicate sessions is no big deal, that means the user has a session
      // anyway. Another error, however, is unexpected
      throw e;
    }
  }
}
