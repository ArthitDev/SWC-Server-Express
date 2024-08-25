import { Router } from "express";
import {
  createArticle,
  getAllArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
  uploadMiddleware,
} from "../controllers/articleController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();

// Route สำหรับการสร้างข้อมูลแผลพร้อมรูปภาพ
router.post("/articles", authenticateToken ,uploadMiddleware, createArticle);

// Route สำหรับการอ่านข้อมูลแผลทั้งหมดและเฉพาะเจาะจง
router.get("/articles", getAllArticles);
router.get("/articles/:id", getArticleById);

// Route สำหรับการอัปเดตข้อมูลแผล
router.put("/articles/:id", authenticateToken ,uploadMiddleware, updateArticle);

// Route สำหรับการลบข้อมูลแผล
router.delete("/articles/:id", authenticateToken ,deleteArticle);

export default router;
