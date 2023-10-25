import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Define the User Schema
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // Ensures email is unique for each user
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "fan",
    },
    block: {
      type: Boolean,
      default: false,
    },
    profilePhoto: {
      type: String,
      default:
        "https://res.cloudinary.com/dikqlipwc/image/upload/v1695717710/abf1qqroqpksib05tu3d.jpg",
    },
    online: {
      type: String,
      default: false,
    },
    playerId: {
      type: mongoose.Types.ObjectId,
      ref: "Player",
      default: null,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps to documents
  }
);

// Hashing password before saving to the database
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) {
    return next();
  }

  // Generate a salt with a complexity of 10
  const salt = await bcrypt.genSalt(10);

  // Hash the password with the salt
  this.password = await bcrypt.hash(this.password, salt);

  // Continue with the save operation
  next();
});

// Comparing passwords during login
userSchema.methods.matchPassword = async function (enteredPassword) {
  // Compare the entered password with the stored hashed password
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create the User model from the schema
const User = mongoose.model("User", userSchema);

export default User;
