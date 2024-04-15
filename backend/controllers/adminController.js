import asyncHandler from "express-async-handler";
import User from "../model/userModel.js";
import Team from "../model/teamModel.js";
import Recruit from "../model/recruitModel.js";
import AcceptRecruit from "../model/acceptRecruitModel.js";
import Player from "../model/playerModel.js";
import mongoose from "mongoose";
import Hightlight from "../model/highLightModel.js";
import Schedules from "../model/schedulModel.js";
import { saveImage, saveVideo } from "../middlewares/cloudinary.js";

//@desc Blocking and Unblocking User
const blockOrUnblockUser = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error("Cant block user at this time ");
  }

  console.log(email);
  const user = await User.findOne({ email });
  if (user) {
    user.block = !user.block;
    await user.save();

    const message = `${user.name} has been blocked`;
    res.status(200).json({ success: user.block, message });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});
const createTeam = asyncHandler(async (req, res) => {

  const { team, strength } = req.body;
  const existingTeam = await Team.findOne({ team });
  if (existingTeam) {
    res.status(404);
    throw new Error(`${team} already exists`);
  }
  let teamPhoto = null;
  if (req.file && req.file.buffer) {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    const cldRes = await saveImage(dataURI);
    console.log("responce", cldRes);
    teamPhoto = cldRes.secure_url;
  }
  const newTeam = await Team.create({
    team,
    strength,
    teamPhoto,
  });
  if (newTeam) {
    res.status(201).json({
      message: "New Team Created Successfully",
      data: newTeam,
    });
  } else {
    res.status(500);
    throw new Error("Cant create a team right now");
  }
});


const getTeams = asyncHandler(async (req, res) => {
  const { query } = req.body;
  const userQuery = {};
  if (query) {
    console.log(query);
    const searchRegex = new RegExp(query, "i");
    userQuery.$or = [{ team: { $regex: searchRegex } }];
  }

  const teams = await Team.find(userQuery);
  if (!teams) {
    res.status(404);
    throw new Error(`server busy`);
  } else {
    res.status(201).json({
      message: "Succes",
      data: teams,
    });
  }
});

const recruitPlayer = asyncHandler(async (req, res) => {
  const { date, team, salary, role } = req.body;

  if (!date && !team && !salary && !role) {
    res.status(500);
    throw new Error("Server busy can't sent right now");
  } else {
    const Recruits = await Recruit.find({ team: team });

    const TeamV = await Team.findOne({ _id: team });

    const noOfvacansy = TeamV.strength - TeamV.players.length;

    if (Number(noOfvacansy) >= Number(Recruits.length)) {
      const recruit = await Recruit.create({
        team,
        salary,
        role,
        endDate: date,
        send: true,
      });
      res.status(201).json({
        message: "Recruitment sent successfully",
        data: recruit,
      });
    } else {
      console.log("error");

      res.status(404);
      throw new Error("Already Sent recruitments for the vacansy");
    }
  }
});

const onGoingRecruitment = asyncHandler(async (req, res) => {
  let { query } = req.body;

  const pipeline = [
    {
      $lookup: {
        from: "teams",
        localField: "team",
        foreignField: "_id",
        as: "teamData",
      },
    },
    {
      $match: {
        send: true,
        $or: [
          { "teamData.team": { $regex: new RegExp(query, "i") } },
          { role: { $regex: new RegExp(query, "i") } },
        ],
      },
    },
  ];

  const Recruitment = await Recruit.aggregate(pipeline);
  if (Recruitment) {
    res.status(201).json({
      message: "Success",
      data: Recruitment,
    });
  }
});

const getAcceptedRecruitment = asyncHandler(async (req, res) => {
  const { query } = req.body;
  console.log(query);

  const pipeline = [
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userData",
      },
    },
    {
      $lookup: {
        from: "recruits",
        localField: "recruitId",
        foreignField: "_id",
        as: "recruitData",
      },
    },
    {
      $lookup: {
        from: "teams",
        localField: "teamId",
        foreignField: "_id",
        as: "teamData",
      },
    },
    {
      $match: {
        accept: true,
        $or: [
          { "userData.name": { $regex: new RegExp(query, "i") } },
          { "recruitData.role": { $regex: new RegExp(query, "i") } },
          { "teamData.team": { $regex: new RegExp(query, "i") } },
        ],
      },
    },
  ];

  try {
    const acceptedRecruit = await AcceptRecruit.aggregate(pipeline);
    if (!acceptedRecruit) {
      res.status(404);
      throw new Error("No data found");
    }

    res.status(200).json({
      message: "Data fetched successfully",
      data: acceptedRecruit,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
});

const createPlayer = asyncHandler(async (req, res) => {
  try {
    const { userId, role, salary, teamId, AcceptRecruitId } = req.body;
    console.log(req.body);
    // Check if the user exists
    const user = await User.findOne({ _id: userId });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Update the user's role to "player"
    console.log("user", user);
    user.role = "player";
    // await user.save();
    console.log("nithin is bullshit");
    // Create a new player
    const newPlayer = await Player.create({
      userId: user._id,
      role,
      salary,
      teamId,
    });
    console.log(newPlayer);
    console.log("newplayer", newPlayer);
    console.log("naihdofihroih");
    // Associate the user with the player
    user.playerId = newPlayer._id;
    await user.save();

    // Delete the AcceptRecruit document
    await AcceptRecruit.deleteOne({ _id: AcceptRecruitId });

    res.status(200).json({
      message: "Player created successfully",
      playerId: newPlayer._id,
    });
  } catch (error) {
    console.error("Error creating player:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const editTeam = asyncHandler(async (req, res) => {
  const { id, strength, team } = req.body;
  if (!id) {
    res.status(404);
    throw new Error("try one more time");
  }

  const updatingTeam = await Team.findOne({ _id: id });
  if (!updatingTeam) {
    res.status(404);
    throw new Error("Server busy");
  }
  if (req.file && req.file.buffer) {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    const cldRes = await saveImage(dataURI);
    updatingTeam.teamPhoto = cldRes.secure_url || updatingTeam.teamPhoto;
  }
  updatingTeam.team = team || updatingTeam.team;
  updatingTeam.strength = strength || updatingTeam.strength;
  await updatingTeam.save();
  res.status(200).json({ message: "succesfull" });
});

const deleteTeam = asyncHandler(async (req, res) => {
  const { id } = req.body;
  if (!id) {
    res.status(404);
    throw new Error("Cant delete now");
  }
  await Team.deleteOne({ _id: id });
  res.status(200).json({ message: "Team Deleted" });
});

const updateRecruits = asyncHandler(async (req, res) => {
  console.log("nithin");
  const { id, salary, role, editDate } = req.body;

  if (!id) {
    res.status(404);
    throw new Error("ID required try again later");
  }
  const recruit = await Recruit.findOne({ _id: id });
  if (!recruit) {
    res.status(404);
    throw new Error("NO recruitments find");
  }

  recruit.role = role || recruit.role;
  recruit.salary = salary || recruit.salary;
  recruit.date = editDate || recruit.endDate;
  await recruit.save();
  res.status(200).json({ message: "succesfull" });
});

const deleteRecruits = asyncHandler(async (req, res) => {
  const { id } = req.body;
  if (!id) {
    res.status(404);
    throw new Error("Can delete at this time");
  }
  await Recruit.deleteOne({ _id: id });
  res.status(200).json({ message: "Success" });
});

const getUserData = asyncHandler(async (req, res) => {
  console.log(req.body);
  const { filterFans, query } = req.body;

  // Create a MongoDB query object to filter users based on the query
  const userQuery = {
    role: "fan",
  };

  if (filterFans === "blocked") {
    userQuery.block = true;
  } else if (filterFans === "notBlocked") {
    userQuery.block = false;
  }

  if (query) {
    const searchRegex = new RegExp(query, "i");
    userQuery.$or = [
      { username: { $regex: searchRegex } },
      { email: { $regex: searchRegex } },
    ];
  }

  try {
    const data = await User.find(userQuery);
    res.status(200).json({ message: "Success", data });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Server Error" });
  }
});

const getPlayer = asyncHandler(async (req, res) => {
  console.log(req.query);
  const { search, filter, page } = req.query;

  const pageSize = 6;
  let PageNumber = parseInt(page) || 1;
  const skip = (PageNumber - 1) * pageSize;

  const pipeline = [
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userData",
      },
    },
    {
      $lookup: {
        from: "teams",
        localField: "teamId",
        foreignField: "_id",
        as: "teamData",
      },
    },
    {
      $match: {
        $or: [
          { "userData.name": { $regex: new RegExp(search, "i") } },
          { "userData.email": { $regex: new RegExp(search, "i") } },
          { role: { $regex: new RegExp(search, "i") } },
          { "teamData.team": { $regex: new RegExp(search, "i") } },
        ],
      },
    },
  ];
  if (filter !== "all") {
    const teamId = new mongoose.Types.ObjectId(filter);

    pipeline.push({
      $match: {
        "teamData._id": teamId,
      },
    });
  }
  const countPipeline = [...pipeline, { $count: "total" }];
  const countResult = await Player.aggregate(countPipeline);

  const totalPlayers = countResult.length > 0 ? countResult[0].total : 0;

  const totalPages = Math.ceil(totalPlayers / pageSize);

  pipeline.push({ $skip: skip }, { $limit: pageSize });

  const player = await Player.aggregate(pipeline);

  res.status(200).json({ message: "Success", data: player, totalPages });
});

const getTeamBasedOnVacancy = asyncHandler(async (req, res) => {
  console.log("nithin");
  const teams = await Team.find({
    $expr: {
      $lt: [{ $size: "$players" }, "$strength"],
    },
  });

  res.status(200).json({ message: "success", data: teams });
});

const addHighlight = asyncHandler(async (req, res) => {
  const { discription } = req.body;

  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  if (!/\.(mp4|mov|avi|wmv|flv|mkv)$/i.test(file.originalname)) {
    return res.status(400).json({ message: "Invalid file format" });
  }
  const videoPath = file.path;
  console.log(videoPath);
  const response = await saveVideo(videoPath);
  console.log("responce", response);
  if (!response) {
    return res.status(500).json({ message: "Error uploading video " });
  }
  await Hightlight.create({
    video: response.secure_url,
    discription,
  });
  res.status(201).json({
    message: "uploaded",
  });
});

const createShedule = asyncHandler(async (req, res) => {
  const { time, date, discription, scheduleType, teamBackend } = req.body;
  console.log(teamBackend);
  if (!time || !date || !discription || !scheduleType) {
    res.status(404);
    throw new Error("try again later");
  }
  console.log(date);
  try {
    const responce = await Schedules.create({
      scheduleType,
      date,
      time,
      discription,
      team: teamBackend,
    });

    if (responce) {
      res.status(201).json({ message: "success" });
    } else {
      res.status(404);
      throw new Error("server busy");
    }
  } catch (error) {
    console.log(error);
  }
});

const getSchedule = asyncHandler(async (req, res) => {
  const { filter, dateFilter } = req.query;
  console.log(req.query);
  const query = {};
  if (filter !== "all") {
    query.scheduleType = filter;
  }
  if (dateFilter !== "null") {
    const date = new Date(dateFilter);
    let formattedDate = date
      .toISOString()
      .replace(/\.\d{3}/, "")
      .replace(/-/g, "/")
      .replace("T", " ")
      .replace("Z", "");

    query.date = formattedDate;
  }

  const schedules = await Schedules.find(query);

  res.status(200).json({ data: schedules, message: "loaded" });
});

const deleteSchedules = asyncHandler(async (req, res) => {
  const { id } = req.query;

  const deletedSchedule = await Schedules.deleteOne({ _id: id });
  res.status(200).json({ message: "success", data: deleteSchedules });
});

const getHighlight = asyncHandler(async (req, res) => {
  const { query } = req.query;
  console.log(query);
  // const pageSize = 6;
  // let PageNumber = parseInt(page) || 1;
  // const skip = (PageNumber - 1) * pageSize;
  const highlight = await Hightlight.find({
    $or: [{ discription: { $regex: query, $options: "i" } }],
  });

  if (highlight) {
    res.status(200).json({ message: "success", data: highlight });
  } else {
    res.status(400);
    throw new Error("server busy");
  }
});

const deleteHighlightHandler = asyncHandler(async (req, res) => {
  const { id } = req.query;
  if (!id) {
    res.status(200);
    throw new Error("No Id Provided");
  }
  const responce = await Hightlight.deleteOne({ _id: id });
  if (responce) {
    res.status(200).json({ message: "Deleted" });
  }
});

const editSchedule = asyncHandler(async (req, res) => {
  console.log("nithin", req.body);
  const { _id, date, time, discription, team, scheduleType } = req.body;
  try {
    const responce = await Schedules.updateOne(
      { _id },
      {
        $set: {
          scheduleType: scheduleType,
          date: date,
          time: time,
          discription: discription,
          team: team,
        },
      }
    );
    console.log("respomce", responce);
    res.status(200).json({ message: "success" });
  } catch (error) {
    console.log(error.message);
  }
});

const onGoingRecruitmentUserSide = asyncHandler(async (req, res) => {
  const onGoingRecruitment = await Recruit.find()
    .populate("team")
    .sort({ endDate: 1 });
  res.status(200).json({ data: onGoingRecruitment, message: "success" });
});

const demotePlayer = asyncHandler(async (req, res) => {
  const { id } = req.query;
  console.log(id);

  const player = await Player.findByIdAndDelete(id);
  console.log(player);
  if (player) {
    const userId = player.userId;
    await User.findByIdAndUpdate(userId, { role: "fan" });

    const result = await Team.updateMany(
      { players: userId },
      { $pull: { players: userId } }
    );
    if (result) {
      res.status(200).json({ message: "successs", result });
    }
  }
});

export {
  getUserData,
  blockOrUnblockUser,
  createTeam,
  getTeams,
  recruitPlayer,
  onGoingRecruitment,
  getAcceptedRecruitment,
  createPlayer,
  editTeam,
  deleteTeam,
  updateRecruits,
  deleteRecruits,
  getPlayer,
  getTeamBasedOnVacancy,
  addHighlight,
  createShedule,
  getSchedule,
  deleteSchedules,
  getHighlight,
  deleteHighlightHandler,
  editSchedule,
  onGoingRecruitmentUserSide,
  demotePlayer,
};
