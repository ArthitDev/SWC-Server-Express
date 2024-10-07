import { Router } from "express";
import { userWoundImageUpload } from "../config/multerConfig";

const router = Router();

// Route สำหรับอัปโหลดรูปภาพจากผู้ใช้
router.post(
  "/user/uploads",
  userWoundImageUpload.single("file"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ detail: "No file uploaded" });
    }

    const imageUrl = `/user_wound_image/${req.file.filename}`;


    res.json({ image_url: imageUrl });
  }
);

export default router;
