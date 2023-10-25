import mongoose from "mongoose";

const highlightSchema = new mongoose.Schema({
  video: {
    type: String,
    required: true,
  },
  discription: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Hightlight = mongoose.model("Hightlight", highlightSchema);

export default Hightlight;
