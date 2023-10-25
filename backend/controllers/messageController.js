import ChatMessage from "../model/chatSchema.js";
import asyncHandler from "express-async-handler";
const getMessage = asyncHandler(async (req, res) => {
  const chat = await ChatMessage.find()
    .populate("user").sort({ timestamp: -1 })
    .limit(100);
  res.status(200).json({ data: chat });
});

export { getMessage };
