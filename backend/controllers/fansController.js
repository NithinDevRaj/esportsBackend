import asyncHandler from "express-async-handler";
import User from "../model/userModel.js";
import AcceptRecruit from "../model/acceptRecruitModel.js";
import { saveImage, saveVideo } from "../middlewares/cloudinary.js";
import Recruit from "../model/recruitModel.js";
import Stream from "../model/streamModel.js";
import Schedules from "../model/schedulModel.js";

const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const user = await User.findOne({ email });
  if (req.file && req.file.buffer) {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    const cldRes = await saveImage(dataURI);
    user.profilePhoto = cldRes.secure_url || user.profilePhoto;
  }

  if (!user) {
    res.status(404);
    throw new Error("Cant update profile right now");
  } else {
    user.name = name || user.name;
    user.password = password || user.password;
    await user.save();
    res.status(200).json({
      message: "User updated successfully",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto,
      },
    });
  }
});

const acceptRecruitment = asyncHandler(async (req, res) => {
  // const file = req.file;
  // console.log(file);
  console.log("nithinraj ssss");
  const { recruitMentID, user_id, teamId } = req.body;
  console.log(req.body);
  console.log(user_id);
  // if (!file) {
  //   return res.status(400).json({ message: "No file uploaded" });
  // }

  // if (!/\.(mp4|mov|avi|wmv|flv|mkv)$/i.test(file.originalname)) {
  //   return res.status(400).json({ message: "Invalid file format" });
  // }

  // const videoPath = file.path;

  // const response = await saveVideo(videoPath);
  // if (response) {
  await Recruit.updateOne(
    { _id: recruitMentID },
    { $push: { acceptedBy: user_id } }
  );
  // }

  // if (!response) {
  //   return res.status(500).json({ message: "Error uploading video " });
  // }

  const recruit = await Recruit.findOne({ _id: recruitMentID });

  if (!recruit) {
    return res.status(404).json({ message: "Recruit not found" });
  }
  console.log("recruit", recruit);

  const acceptedRecruit = await AcceptRecruit.create({
    // video: response.secure_url,
    recruitId: recruit._id,
    userId: user_id,
    accept: true,
    teamId: teamId,
  });

  res.status(201).json({
    message: "Recruitment accepted successfully",
    data: acceptedRecruit,
  });
});

const getStream = asyncHandler(async (req, res) => {
  const streams = await Stream.find();

  if (streams) {
    res.status(200).json({
      message: "success",
      data: streams,
    });
  }
});
const getProfile = asyncHandler(async (req, res) => {
  console.log("nithin raj s ");
  const { id } = req.body;
  if (!id) {
    res.status(404);
    throw new Error("can get credential right now login again");
  }
  const user = await User.findOne({ _id: id });
  if (user) {
    res.status(200).json({ message: "Succes", data: user });
  } else {
    res.status(404);
    throw new Error("Server Busy");
  }
});

const getSchedule = asyncHandler(async (req, res) => {
  console.log("nithin");
  const schedule = await Schedules.find().populate();
  res.status(200).json({
    data: schedule,
    message: "succsess",
  });
});

const getUser = asyncHandler(async (req, res) => {
  const { ID } = req.query;
  console.log(req.query);
  const user = await User.findOne({ _id: ID });
  if (user) {
    res.status(200).json({ data: user });
  }
});
export {
  updateProfile,
  acceptRecruitment,
  getStream,
  getProfile,
  getSchedule,
  getUser,
};
