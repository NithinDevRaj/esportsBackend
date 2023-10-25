import mongoose from "mongoose";

// Define the User Schema
const playerSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    salary: {
      type: Number,

      require: true,
    },
    teamId: {
      type: mongoose.Types.ObjectId,
      ref: "Team",
      required: true,
    },
  
  },
  {
    timestamps: true,
  }
);

// Create the User model from the schema
const Player = mongoose.model("Player", playerSchema);

export default Player;
