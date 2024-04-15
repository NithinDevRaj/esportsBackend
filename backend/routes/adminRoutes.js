import express from "express";
const router = express.Router();
import { upload, videoUpload } from "../middlewares/multer.js";
import {
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
} from "../controllers/adminController.js";

router.put("/fans", getUserData);
router.patch("/fans", blockOrUnblockUser);

router.post("/team", upload.single("teamPhoto"), createTeam);
router.post("/teams", getTeams);
router.post("/recruit", recruitPlayer);
router.post("/recruits", onGoingRecruitment);
router.post("/getAcceptedRecruitment", getAcceptedRecruitment);
router.post("/createPlayer", createPlayer);
router.patch("/team", upload.single("teamPhoto"), editTeam);
router.put("/team", deleteTeam);
router.put("/recruit", updateRecruits);
router.patch("/recruit", deleteRecruits);
router.get("/player", getPlayer);
router.get("/team", getTeamBasedOnVacancy);
router.post("/highlight", videoUpload.single("video"), addHighlight);

router.post("/schedule", createShedule);
router.get("/schedule", getSchedule);
router.delete("/schedule", deleteSchedules);

router.get("/highlight", getHighlight);
router.delete("/highlight", deleteHighlightHandler);
router.put("/schedule", editSchedule);
router.get("/recruitment", onGoingRecruitmentUserSide);
router.delete("/player", demotePlayer);
export default router;
