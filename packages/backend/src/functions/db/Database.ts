import { MongoClient, Db } from "mongodb";
class Database {
  private static instance: Database;
  private static DB_URL = process.env.MONGODB_URI
    ? process.env.MONGODB_URI
    : "mongodb://localhost:27017/malte";

  private db: Db;
  private client: MongoClient;

  private constructor() {
    this.registerCleanUpOnCrash();
  }

  public async connect(): Promise<void> {
    const client = await MongoClient.connect(Database.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    this.db = client.db();
    this.client = client;
    this.initialize();
  }

  private async initialize(): Promise<void> {
    const collection = this.client.db().collection("config");
    collection.find({ firstTime: { $exists: 1 } }).toArray(function(err, doc) {
      if (doc.length == 0) {
        collection.insertOne({ firstTime: true });
      }
    });
  }

  public getDb(): Db {
    this.isConnected();
    return this.db;
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  private isConnected(): void {
    if (!this.db || !this.client) {
      throw new Error(
        "Database is not connected. Forgot to run Database.connect()?"
      );
    }
  }

  private registerCleanUpOnCrash(): void {
  }

  private cleanUp(exit: boolean): void {
    if (this.client) {
      this.client.close();
      this.client = undefined;
    }
    exit && process.exit();
  }
}

export default Database;
