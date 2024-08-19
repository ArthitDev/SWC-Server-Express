import { Request, Response } from "express";

export const getMainInfo = (req: Request, res: Response) => {
  res.json({
    message: "SWC API Gateway!",
    note: "โปรดดูเอกสารประกอบเกี่ยวกับวิธีการใช้ API เหล่านี้.",
    main_endpoints: {
      "/api/register": "ลงทะเบียนผู้ดูแลระบบใหม่",
      "/api/login": "เข้าสู่ระบบสำหรับผู้ดูแลระบบที่มีอยู่แล้ว",
      "/api/logout": "ใช้สำหรับ logout ออกจากระบบโดยลบ cookie จาก back-end",
      "/api/request-password-reset": "ขอลิงก์รีเซ็ตรหัสผ่าน",
      "/api/reset-password": "รีเซ็ตรหัสผ่านโดยใช้โทเค็น",
      "/api/refresh-token": "ขอ accessToken ใหม่ โดยใช้ refreshToken",
      "/api/admin": "Route ที่มีการป้องกันโดยใช้ Middleware",
      "/api/profile": "ใช้ดึงข้อมูล Admin ที่เข้าสู่ระบบ",
    },
    crud_wound_endpoint: {
      "GET : /api/wounds": "ดึงข้อมูลแผลทั้งหมด",
      "GET : /api/wounds/:id": "ดึงข้อมูลแผลตาม ID",
      "POST : /api/wounds": "เพิ่มข้อมูลแผลใหม่",
      "PUT : /api/wounds/:id": "แก้ไขหรืออัพเดทข้อมูลแผล",
      "DELETE : /api/wounds/:id": "ลบข้อมูลแผล",
    },
    crud_article_endpoint: {
      "GET : /api/articles": "ดึงข้อมูลบทความทั้งหมด",
      "GET : /api/articles/:id": "ดึงข้อมูลบทความตาม ID",
      "POST : /api/articles": "เพิ่มข้อมูบทความใหม่",
      "PUT : /api/articles/:id": "แก้ไขหรืออัพเดทข้อมูลบทความ",
      "DELETE : /api/articles/:id": "ลบข้อมูลบทความ",
    },
    crud_trick_endpoint: {
      "GET : /api/tricks": "ดึงข้อมูลเคล็ดไม่ลับทั้งหมด",
      "GET : /api/tricks/:id": "ดึงข้อมูลเคล็ดไม่ลับตาม ID",
      "POST : /api/tricks": "เพิ่มข้อมูลเคล็ดไม่ลับใหม่",
      "PUT : /api/tricks/:id": "แก้ไขหรืออัพเดทข้อมูลเคล็ดไม่ลับ",
      "DELETE : /api/tricks/:id": "ลบข้อมูลเคล็ดไม่ลับ",
    },
    crud_didyouknow_endpoint: {
      "GET : /api/didyouknow": "ดึงข้อมูลรู้หรือไม่ทั้งหมด",
      "GET : /api/didyouknow/:id": "ดึงข้อมูลรู้หรือไม่ตาม ID",
      "POST : /api/didyouknow": "เพิ่มข้อมูลรู้หรือไม่ใหม่",
      "PUT : /api/didyouknow/:id": "แก้ไขหรืออัพเดทข้อมูลรู้หรือไม่",
      "DELETE : /api/didyouknow/:id": "ลบข้อมูลเคล็ดไม่ลับ",
    },
    ai_predict_endpoint: {
      "api/ai": "ยังไม่มี",
    },
  });
};
