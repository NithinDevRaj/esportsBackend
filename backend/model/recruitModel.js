import mongoose from "mongoose";

// Define the User Schema
const recruitSchema = mongoose.Schema(
  {
    team: {
      type: mongoose.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    salary: {
      type: Number,
      required: true,
    },
    role: {
      type: String,
      require: true,
    },
    send: {
      type: Boolean,
      default: false,
    },
    endDate: {
      type: Date,
      required: false,
    },
    acceptedBy:[
      {
        type:mongoose.Types.ObjectId,
        ref:"User"
      }
    ]
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps to documents
  }
);

// Create the User model from the schema
const Recruit = mongoose.model("Recruit", recruitSchema);

export default Recruit;
