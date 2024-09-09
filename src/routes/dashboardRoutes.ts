import { Router } from "express";
import {
  getDashboardData,
  getAllArticlesWithClicks,
  getAllWoundsWithClicks,
} from "../controllers/dashboardController";

const router = Router();

// Route สำหรับดึงข้อมูลทั้งหมดใน Dashboard
router.get("/dashboard", getDashboardData);
router.get("/dashboard/article-click", getAllArticlesWithClicks);
router.get("/dashboard/wound-click", getAllWoundsWithClicks);

export default router;
