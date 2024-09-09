import { Router } from "express";
import { woundClick } from "./../controllers/woundClickController";

const router = Router();

// Route สำหรับการบันทึกการคลิกของบทความที่มี ID เฉพาะเจาะจง
router.post("/wounds/:woundId/click", woundClick);

export default router;
