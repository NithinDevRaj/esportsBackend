import mongoose from "mongoose";

// Define the User Schema
const streamSchema = mongoose.Schema(
  {
    playerId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    thumbnail: {
      type: String,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps to documents
  }
);

// Create the User model from the schema
const Stream = mongoose.model("Stream", streamSchema);

export default Stream;
