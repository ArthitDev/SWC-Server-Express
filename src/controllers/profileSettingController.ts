import { CustomRequest } from "../middlewares/authMiddleware";
import { Response } from "express";
import { getRepository } from "typeorm";
import { Admin } from "../entities/Admin";
import bcrypt from "bcrypt";

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
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ฟังก์ชันสำหรับการเปลี่ยนรหัสผ่าน
export const changePassword = async (req: CustomRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.password = hashedNewPassword;

    const adminRepository = getRepository(Admin);
    await adminRepository.save(user);

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ฟังก์ชันสำหรับการอัพเดตโปรไฟล์
export const updateProfile = async (req: CustomRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  const userId = req.user.id;
  const { username, email, currentPassword, newPassword } = req.body;

  try {
    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // อัพเดตชื่อผู้ใช้และอีเมล (ถ้าผู้ใช้ส่งข้อมูลมา)
    if (username) user.username = username;
    if (email) user.email = email;

    // ตรวจสอบรหัสผ่านปัจจุบันและอัพเดตรหัสผ่านใหม่ (ถ้าผู้ใช้ส่งข้อมูลมา)
    if (currentPassword && newPassword) {
      const passwordMatch = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!passwordMatch) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
      user.password = hashedNewPassword;
    }

    const adminRepository = getRepository(Admin);
    await adminRepository.save(user);

    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Internal server error" });
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
    res.json({ message: "Account deactivated successfully" });
  } catch (error) {
    console.error("Error deactivating account:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

