import { MongoClient } from "mongodb";

const mongoUrl = process.env.MONGODB_URL;

if (!mongoUrl) {
  throw new Error("Please add your MongoDB URI to .env");
}

// In development mode, use a global variable so the client is not recreated on hot reload
let cachedClient: MongoClient;

if (typeof window === "undefined") {
  // @ts-ignore - global type extension for Node.js development
  if ((global as any).mongoClient) {
    cachedClient = (global as any).mongoClient;
  } else {
    cachedClient = new MongoClient(mongoUrl);
    // @ts-ignore - global type extension for Node.js development
    (global as any).mongoClient = cachedClient;
  }
} else {
  cachedClient = new MongoClient(mongoUrl);
}

export default cachedClient;