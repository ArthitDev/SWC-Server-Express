import { Request, Response } from "express";
import { getRepository } from "typeorm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Admin } from "../entities/Admin";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "your_refresh_token_secret";

export const loginAdmin = async (req: Request, res: Response) => {
  const { username, password, rememberMe } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
  }

  try {
    const adminRepository = getRepository(Admin);
    const admin = await adminRepository.findOne({
      where: { username, is_deleted: 0 },
    });

    if (!admin) {
      return res
        .status(401)
        .json({
          message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง หรือบัญชีถูกลบแล้ว",
        });
    }

    const match = await bcrypt.compare(password, admin.password);

    if (!match) {
      return res
        .status(401)
        .json({ message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
    }

    // ตั้งเวลา expiration ของ token ตามค่าของ rememberMe
    const accessTokenExpiration = rememberMe ? "7d" : "1h";
    const refreshTokenExpiration = rememberMe ? "30d" : "7d";

    const accessToken = jwt.sign(
      { id: admin.id, username: admin.username },
      JWT_SECRET,
      { expiresIn: accessTokenExpiration }
    );

    const refreshToken = jwt.sign(
      { id: admin.id, username: admin.username },
      REFRESH_TOKEN_SECRET,
      { expiresIn: refreshTokenExpiration }
    );

    // ตั้งค่า maxAge ของ cookie ตามค่า rememberMe
    const accessTokenMaxAge = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 3600000;
    const refreshTokenMaxAge = rememberMe
      ? 30 * 24 * 60 * 60 * 1000
      : 7 * 24 * 60 * 60 * 1000;

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: accessTokenMaxAge,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: refreshTokenMaxAge,
    });

    return res.status(200).json({ message: "เข้าสู่ระบบสำเร็จ" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" });
  }
};

