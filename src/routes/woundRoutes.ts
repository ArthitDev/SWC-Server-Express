import { Router } from "express";
import {
  createWound,
  getAllWounds,
  getWoundById,
  updateWound,
  deleteWound,
  uploadMiddleware,
} from "../controllers/woundController";

const router = Router();

// Route สำหรับการสร้างข้อมูลแผลพร้อมรูปภาพ
router.post("/wounds", uploadMiddleware, createWound);

// Route สำหรับการอ่านข้อมูลแผลทั้งหมดและเฉพาะเจาะจง
router.get("/wounds", getAllWounds);
router.get("/wounds/:id", getWoundById);

// Route สำหรับการอัปเดตข้อมูลแผล
router.put("/wounds/:id", uploadMiddleware, updateWound);

// Route สำหรับการลบข้อมูลแผล
router.delete("/wounds/:id", deleteWound);

export default router;
