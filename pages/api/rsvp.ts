import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/utils/db.connect";
import { ObjectId } from "mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    const rsvps = db.collection("rsvps");

    const { name, attending, guests } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const result = await rsvps.insertOne({
      name,
      attending,
      guests: guests || 1,
      timestamp: new Date(),
    });

    res.status(201).json({
      success: true,
      data: { id: result.insertedId.toString(), name, attending, guests: guests || 1 },
    });
  } catch (error) {
    console.error("RSVP error:", error);
    res.status(500).json({ error: "Failed to save RSVP" });
  }
}