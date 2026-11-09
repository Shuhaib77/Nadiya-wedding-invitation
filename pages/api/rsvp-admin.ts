import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/utils/db.connect";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const rsvps = db.collection("rsvps");

    const allRsvps = await rsvps
      .find()
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray();

    res.status(200).json({
      success: true,
      data: allRsvps.map((r) => ({
        id: r._id.toString(),
        name: r.name,
        attending: r.attending,
        guests: r.guests,
        timestamp: r.timestamp,
      })),
    });
  } catch (error) {
    console.error("Admin RSVP error:", error);
    res.status(500).json({ error: "Failed to fetch RSVPs" });
  }
}