import ChatMessage from "../model/chatSchema.js";
import asyncHandler from "express-async-handler";

const getMessage = asyncHandler(async (req, res) => {
  console.log("nithinraj s");
  const chat = await ChatMessage.find()
    .populate("user")
    .sort({ timestamp: -1 })
    .limit(100);
  console.log(chat);
  res.status(200).json({ data: chat });
});

export { getMessage };
