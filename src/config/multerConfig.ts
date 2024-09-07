// src/config/multerConfig.ts
import multer from "multer";
import path from "path";
import fs from "fs";

// ฟังก์ชันสร้างโฟลเดอร์หากยังไม่มี
const createDirectoryIfNotExists = (directory: string) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

// กำหนดโฟลเดอร์สำหรับเก็บรูปภาพแต่ละประเภท
const baseUploadDir = path.join(__dirname, "../uploads");
const woundImageDir = path.join(baseUploadDir, "wound_image");
const articleImageDir = path.join(baseUploadDir, "article_image");

// สร้างโฟลเดอร์หากยังไม่มี
createDirectoryIfNotExists(woundImageDir);
createDirectoryIfNotExists(articleImageDir);

// ฟังก์ชันกำหนดการตั้งค่า multer ตามประเภทของภาพ
const getMulterStorage = (folder: string) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, folder);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}_${file.originalname}`);
    },
  });
};

// กำหนดตัวเลือกของ multer พร้อมการตั้งค่าขนาดไฟล์สูงสุดและการกรองประเภทไฟล์
const multerOptions = (folder: string) => {
  return {
    storage: getMulterStorage(folder),
    limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10 MB
    fileFilter: (
      req: Express.Request,
      file: Express.Multer.File,
      cb: multer.FileFilterCallback
    ) => {
      const fileTypes = /jpeg|jpg|png|gif/;
      const extname = fileTypes.test(
        path.extname(file.originalname).toLowerCase()
      );
      const mimeType = fileTypes.test(file.mimetype);

      if (extname && mimeType) {
        return cb(null, true);
      } else {
        cb(new Error("Only images are allowed!"));
      }
    },
  };
};

export const woundImageUpload = multer(multerOptions(woundImageDir));
export const articleImageUpload = multer(multerOptions(articleImageDir));
