import express from "express";
const router = express.Router();
import { createLive, deleteLive } from "../controllers/playerController.js";
import { upload } from "../middlewares/multer.js";
router.post("/createLive", upload.single("thumbnail"), createLive);
router.delete("/live",deleteLive)
export default router;
