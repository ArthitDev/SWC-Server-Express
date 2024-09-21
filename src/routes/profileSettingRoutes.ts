import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import {
  getProfile,
  changePassword,
  updateProfileWithImage,
  deactivateAccount,
} from "../controllers/profileSettingController";
import { uploadProfileImage } from "../middlewares/uploadMiddleware";
import WebSocket from "ws";


const router = express.Router();

const sendWebSocketMessage = (wss: WebSocket.Server, message: string) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

// Route สำหรับการดึงข้อมูลโปรไฟล์
router.get("/profile-setting", authenticateToken, getProfile);

// Route สำหรับการเปลี่ยนรหัสผ่าน
router.post("/change-password", authenticateToken, changePassword);

// Route สำหรับการอัพเดตโปรไฟล์
router.patch(
  "/profile-setting/:id",
  authenticateToken,
  uploadProfileImage,
  async (req, res, next) => {
    try {
      const wss = req.app.get("wss") as WebSocket.Server;
      await updateProfileWithImage(req, res);
      sendWebSocketMessage(
        wss,
        JSON.stringify({
          eventType: "UPDATE_PROFILE",
          data: "Profile updated successfully",
        })
      );
    } catch (error) {
      console.error("Error updating profile:", error);
      next(error);
    }
  }
);




// Route สำหรับการปิดใช้งานบัญชี
router.patch("/delete-account", authenticateToken, deactivateAccount);


export default router;
