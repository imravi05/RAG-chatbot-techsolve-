import express from "express";
import { chatWithVideos } from "../controllers/chat.controller.js";

const router = express.Router();

// POST /api/v1/chat — ask a question about the analyzed videos
router.post("/", chatWithVideos);

export default router;
