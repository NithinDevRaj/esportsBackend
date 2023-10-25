// import mongoose from "mongoose";

// // Define the User Schema
// const acceptRecruitSchema = mongoose.Schema(
//   {
//     video: {
//       type: String,
//       required: true,
//     },
//     userId: {
//       type: Number,
//       required: true,
//     },
//     recruitId: {
//       type: String,
//       required: true, // Corrected from "require" to "required"
//     },
//     accept: {
//       type: Boolean,
//       default: false ,
//     },
//   },
//   {
//     timestamps: true, // Adds createdAt and updatedAt timestamps to documents
//   }
// );

// // Create the User model from the schema
// const AcceptRecruit = mongoose.model("AcceptRecruit", acceptRecruitSchema);

// export default AcceptRecruit;
import mongoose from "mongoose";

// Define the User Schema
const AcceptRecruitSchema = mongoose.Schema(
  {
    video: {
      type: String,
      required: true,
    },
    recruitId: {
      type: mongoose.Types.ObjectId,
      ref: "Recruit",

      required: true,
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      require: true,
    },
    teamId: {
      type: mongoose.Types.ObjectId,
      ref: "Team",
      require: true,
    },
    accept: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create the User model from the schema
const AcceptRecruit = mongoose.model("AcceptRecruit", AcceptRecruitSchema);

export default AcceptRecruit;
