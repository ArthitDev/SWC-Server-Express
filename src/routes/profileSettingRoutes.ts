import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import {
  getProfile,
  changePassword,
  updateProfileWithImage,
  deactivateAccount,
} from "../controllers/profileSettingController";
import { uploadProfileImage } from "../middlewares/uploadMiddleware";

const router = express.Router();

// Route สำหรับการดึงข้อมูลโปรไฟล์
router.get("/profile-setting", authenticateToken, getProfile);

// Route สำหรับการเปลี่ยนรหัสผ่าน
router.post("/change-password", authenticateToken, changePassword);

// Route สำหรับการอัพเดตโปรไฟล์
router.patch(
  "/profile-setting/:id",
  authenticateToken,
  uploadProfileImage,
  updateProfileWithImage
);



// Route สำหรับการปิดใช้งานบัญชี
router.patch("/delete-account", authenticateToken, deactivateAccount);


export default router;
