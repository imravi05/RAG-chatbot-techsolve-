import express from "express";
import { analyzeVideos } from "../controllers/video.controller.js";

const router = express.Router();

router.post("/analyze", analyzeVideos);

export default router;