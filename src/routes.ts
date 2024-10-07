import { Request, Response } from "express";

export const getMainInfo = (req: Request, res: Response) => {
  res.json({
    message: "SWC API Gateway!",
    note: "โปรดดูเอกสารประกอบหรือติดต่อผู้พัฒนาเกี่ยวกับวิธีการใช้ API เหล่านี้.",
    main_endpoints: {
      "POST : /api/register": "ลงทะเบียนผู้ดูแลระบบใหม่",
      "POST : /api/login": "เข้าสู่ระบบสำหรับผู้ดูแลระบบที่มีอยู่แล้ว",
      "POST : /api/logout": "ใช้สำหรับ logout ออกจากระบบโดยลบ cookie ผ่าน server",
      "POST : /api/request-password-reset": "ขอลิงก์รีเซ็ตรหัสผ่านด้วยอีเมล",
      "POST : /api/reset-password": "รีเซ็ตรหัสผ่านโดยใช้โทเค็น",
      "POST : /api/refresh-token": "ขอ accessToken ใหม่ โดยใช้ refreshToken",
      "GET : /api/admin": "Route ที่มีการป้องกันโดยใช้ Middleware",
      "GET : /api/profile": "ใช้ดึงข้อมูล Admin ที่เข้าสู่ระบบ",
      "PUT : /api/profile-setting": "ใช้แก้ไขข้อมูล Admin ที่เข้าสู่ระบบ",
      "POST : /api/protected": "ใช้สำหรับการตรวจสอบความถูกต้องของค่าที่ส่งมา",
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
    save_click_data_endpoint: {
      "POST: /api/articles/:articleId/click": "บันทึกข้อมูลการอ่านบทความ",
      "POST: /api/wounds/:woundId/click": "บันทึกข้อมูลการอ่านแผล",
    },
    statistics_endpoint: {
      "GET: /api/top-articles": "ดึงข้อมูลการอ่านบทความสูงสุด 5 อันดับ",
    },
    contact_endpoint: {
      "POST: /api/contact": "ส่งข้อมูลติดต่อ",
      "GET: /api/contact": "ดึงข้อมูลติดต่อทั้งหมด",
      "GET: /api/contact/:id": "ดึงข้อมูลติดต่อตาม ID",
      "PUT: /api/contact/:id": "แก้ไขหรืออัพเดทข้อมูลติดต่อ",
      "DELETE: /api/contact/:id": "ลบข้อมูลติดต่อ",
    },
    dashboard_data_endpoint: {
      "GET: /api/dashboard": "ดึงขจำนวนข้อมูลทั้งหมด",
      "GET: /api/dashboard/article-click": "ดึงข้อมูลการอ่านบทความ",
      "GET: /api/dashboard/wound-click": "ดึงข้อมูลการอ่านแผล",
    },
    image_data_endpoint: {
      "GET: /api/uploads": "ดึงข้อมูลรูปภาพจาก Server ตาม Path ที่เก็บไว้ใน DB",
    },
    ai_predict_endpoint: {
      "POST: ai.smartwoundcare.site/predict": "ส่งรูปวิเคราะห์ไปที่ AI Server",
      "POST: /api/wounds/type": "ดึงข้อมูลประเภทแผลเทียบกับ AI สำหรับข้อมูลแผลเพิ่มเติม",
    },
  });
};
