import { CustomRequest } from "../middlewares/authMiddleware";
import { getRepository } from "typeorm";
import { Admin } from "../entities/Admin";
import bcrypt from "bcrypt";
import path from "path";
import fs from "fs";
import { Request, Response } from "express";

const SALT_ROUNDS = 10;

// ฟังก์ชันเพื่อค้นหาผู้ใช้ตาม ID
const findUserById = async (id: number) => {
  const adminRepository = getRepository(Admin);
  try {
    const user = await adminRepository.findOne({
      where: { id, is_deleted: 0 },
    });
    return user;
  } catch (error) {
    console.error("Error finding user:", error);
    throw new Error("Database query failed");
  }
};

// ฟังก์ชันสำหรับการดึงข้อมูลโปรไฟล์
export const getProfile = async (req: CustomRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  const userId = req.user.id;

  try {
    const user = await findUserById(userId);
    if (!user) {
      res.clearCookie("accessToken", { path: "/" });
      res.clearCookie("refreshToken", { path: "/" });
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      profileImage: user.profile_image, 
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};


// ฟังก์ชันสำหรับการเปลี่ยนรหัสผ่าน
export const changePassword = async (req: CustomRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "แอดมินยังไม่ได้เข้าสู่ระบบ" });
  }

  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "ไม่พบบัญชีแอดมินนี้" });
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: "รหัสผ่านปัจจุบันไม่ถูกต้อง" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.password = hashedNewPassword;

    const adminRepository = getRepository(Admin);
    await adminRepository.save(user);

    res.json({ message: "เปลี่ยนรหัสผ่านสำเร็จแล้ว !" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ฟังก์ชันอัปเดตข้อมูลโปรไฟล์พร้อมรูปภาพ
export const updateProfileWithImage = async (req: Request, res: Response) => {
  const adminRepository = getRepository(Admin);

  try {
    const user = await adminRepository.findOne({
      where: { id: parseInt(req.params.id, 10) },
    });

    if (!user) {
      return res.status(404).json({ message: "ไม่พบบัญชีแอดมินนี้" });
    }

    const { username, email } = req.body;

    // อัปเดตข้อมูลผู้ใช้
    user.username = username ?? user.username;
    user.email = email ?? user.email;

    // ตรวจสอบว่ามีการอัปโหลดรูปโปรไฟล์ใหม่หรือไม่
    if (req.file) {
      // ตรวจสอบว่ามีรูปโปรไฟล์เก่าอยู่ก่อนที่จะพยายามลบ
      if (user.profile_image) {
        const oldFilePath = path.join(
          __dirname,
          "../uploads/profile_image",
          user.profile_image
        );

        // ลบรูปโปรไฟล์เก่า
        fs.unlink(oldFilePath, (err) => {
          if (err) console.error("Error deleting old profile image:", err);
        });
      }

      // บันทึกเส้นทางรูปภาพใหม่
      const newProfileImagePath = `profile_image/${req.file.filename}`;
      user.profile_image = newProfileImagePath;
    }

    // บันทึกข้อมูลที่อัปเดตลงในฐานข้อมูล
    await adminRepository.save(user);

    res.status(200).json({
      message: "แก้ไขข้อมูลสำหรับบัญชีแอดมินเรียบร้อยแล้ว",
      user,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Error updating profile", error });
  }
};


// ฟังก์ชันสำหรับการปิดใช้งานบัญชี
export const deactivateAccount = async (req: CustomRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  const userId = req.user.id;

  try {
    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ปิดใช้งานบัญชีโดยการเปลี่ยนค่า is_deleted เป็น 1
    user.is_deleted = 1;

    const adminRepository = getRepository(Admin);
    await adminRepository.save(user);

    // ล้างคุกกี้ accessToken และ refreshToken
    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("refreshToken", { path: "/" });

    // ส่งผลลัพธ์เมื่อปิดบัญชีสำเร็จ
    res.json({ message: "ลบบัญชีสำเร็จ" });
  } catch (error) {
    console.error("Error deactivating account:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
