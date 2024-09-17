import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import {
  getProfile,
  changePassword,
  updateProfile,
  deactivateAccount,
} from "../controllers/profileSettingController";

const router = express.Router();

// Route สำหรับการดึงข้อมูลโปรไฟล์
router.get("/profile-setting", authenticateToken, getProfile);

// Route สำหรับการเปลี่ยนรหัสผ่าน
router.post("/change-password", authenticateToken, changePassword);

// Route สำหรับการอัพเดตโปรไฟล์
router.patch("/update-profile", authenticateToken, updateProfile);

// Route สำหรับการปิดใช้งานบัญชี
router.patch("/delete-account", authenticateToken, deactivateAccount);

export default router;
