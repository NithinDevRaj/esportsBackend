import mongoose from "mongoose";

// Define the User Schema
const teamSchema = mongoose.Schema(
  {
    team: {
      type: String,
      required: true,
    },
    strength: {
      type: Number,
      required: true,
    },
    teamPhoto: {
      type: String,
    },
    players: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player",
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps to documents
  }
);

teamSchema.path("players").default(function () {
  return [];
});


// Create the User model from the schema
const Team = mongoose.model("Team", teamSchema);

export default Team;
