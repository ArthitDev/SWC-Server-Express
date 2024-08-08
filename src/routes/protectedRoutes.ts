import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = express.Router();

// Route ที่ต้องการการตรวจสอบ token
router.get("/admin", authenticateToken, (req, res) => {
  res.status(200).json({ message: "คุณเข้าถึงข้อมูลที่ป้องกันไว้ได้" });
});

export default router;
