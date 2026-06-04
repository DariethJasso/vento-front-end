import { NextApiRequest } from "next";
import { NextApiResponseWithSocket, initSocketServer } from "@/lib/socket/server";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  if (req.method === "GET" || req.method === "POST") {
    initSocketServer(res);
    res.status(200).json({ message: "Socket server initialized" });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
