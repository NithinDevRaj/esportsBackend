import express from "express";
import { getMessage } from "../controllers/messageController.js";
const router = express.Router();


router.get("/", getMessage);

export default router;