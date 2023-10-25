import asyncHandler from "express-async-handler";
import Stream from "../model/streamModel.js";
import { saveImage } from "../middlewares/cloudinary.js";
const createLive = asyncHandler(async (req, res) => {
  console.log(req.body);
  const { playerId, title, description } = req.body;
  let thumbnail = null;
  if (req.file && req.file.buffer) {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    const cldRes = await saveImage(dataURI);
    thumbnail = cldRes.secure_url;
  }
  const newStream = await Stream.create({
    playerId,
    title,
    description,
    thumbnail,
  });
  res.status(200).json({ message: "started streaming", data: newStream });
});

const deleteLive = asyncHandler(async (req, res) => {
  const { room_id } = req.query;
  if (!room_id) {
    res.status(404);
    throw new Error("Room ID is not valid");
  }
  const deleteResult = await Stream.deleteMany({ playerId: room_id });
  console.log(deleteResult);
  res.status(201).json({ message: "success" });
});

export { createLive, deleteLive };
