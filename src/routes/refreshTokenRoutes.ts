import express from "express";
import { refreshToken } from "../controllers/refreshTokenController";

const router = express.Router();

// Route สำหรับรีเฟรช access token
router.post("/refresh-token", refreshToken);

export default router;
