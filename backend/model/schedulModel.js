import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema({
  scheduleType: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: Date,
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
  team: {
    type: mongoose.Types.ObjectId,
    ref: "team",
  },
});

const Schedules = mongoose.model("Schedules", scheduleSchema);

export default Schedules;
