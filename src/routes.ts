import { Request, Response } from "express";

export const getMainInfo = (req: Request, res: Response) => {
  res.json({
    message: "ยินดีต้อนรับสู่ SWC Admin API Gateway!",
    endpoints: {
      "/api/register": "ลงทะเบียนผู้ดูแลระบบใหม่",
      "/api/login": "เข้าสู่ระบบสำหรับผู้ดูแลระบบที่มีอยู่แล้ว",
      "/api/request-password-reset": "ขอลิงก์รีเซ็ตรหัสผ่าน",
      "/api/reset-password": "รีเซ็ตรหัสผ่านโดยใช้โทเค็น",
    },
    note: "โปรดดูเอกสารประกอบสำหรับรายละเอียดเพิ่มเติมเกี่ยวกับวิธีการใช้ API เหล่านี้.",
  });
};
