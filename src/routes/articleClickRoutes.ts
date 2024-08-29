import { Router } from "express";
import { articleClick } from "../controllers/articleClickController";

const router = Router();

// Route สำหรับการบันทึกการคลิกของบทความที่มี ID เฉพาะเจาะจง
router.post("/articles/:articleId/click", articleClick);


export default router;
