// src/routes/uploadsRoutes.ts
import { Router } from "express";
import path from "path";
import express from "express";

const router = Router();

// กำหนดให้ Express เสิร์ฟไฟล์สาธารณะจากโฟลเดอร์ uploads ที่มี prefix เป็น /api/uploads
router.use("/uploads", express.static(path.join(__dirname, "../uploads")));

export default router;
