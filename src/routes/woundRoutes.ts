import { Router } from "express";
import {
  createWound,
  getAllWounds,
  getWoundById,
  updateWound,
  deleteWound,
  uploadMiddleware,
} from "../controllers/woundController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();

// Route สำหรับการสร้างข้อมูลแผลพร้อมรูปภาพ
router.post("/wounds", authenticateToken, uploadMiddleware, createWound);

// Route สำหรับการอ่านข้อมูลแผลทั้งหมดและเฉพาะเจาะจง
router.get("/wounds", getAllWounds);
router.get("/wounds/:id", getWoundById);

// Route สำหรับการอัปเดตข้อมูลแผล
router.put("/wounds/:id", authenticateToken,uploadMiddleware, updateWound);

// Route สำหรับการลบข้อมูลแผล (เพิ่ม authenticateToken)
router.delete("/wounds/:id", authenticateToken, deleteWound);

export default router;
