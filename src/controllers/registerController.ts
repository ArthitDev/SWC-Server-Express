import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Admin } from "../entities/Admin";
import bcrypt from "bcrypt";

export const registerAdmin = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  // ตรวจสอบข้อมูล
  if (!username || !email || !password) {
    return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร" });
  }

  try {
    const adminRepository = getRepository(Admin);
    const existingAdmin = await adminRepository.findOne({
      where: [{ username }, { email }],
    });

    if (existingAdmin) {
      return res
        .status(400)
        .json({ message: "ชื่อผู้ใช้หรืออีเมลนี้มีอยู่แล้ว" });
    }

    // สร้าง salt และเข้ารหัสรหัสผ่าน
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // สร้าง Admin ใหม่
    const newAdmin = adminRepository.create({
      username,
      email,
      password: hashedPassword,
    });

    await adminRepository.save(newAdmin);

    return res.status(201).json({ message: "ลงทะเบียนสำเร็จ" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการลงทะเบียน" });
  }
};
