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
export const woundImageDir = path.join(baseUploadDir, "wound_image"); // ทำการ export
const articleImageDir = path.join(baseUploadDir, "article_image");
const profileImageDir = path.join(baseUploadDir, "profile_image");
const userWoundImageDir = path.join(baseUploadDir, "user_wound_image"); 

// สร้างโฟลเดอร์หากยังไม่มี
createDirectoryIfNotExists(woundImageDir);
createDirectoryIfNotExists(articleImageDir);
createDirectoryIfNotExists(profileImageDir);
createDirectoryIfNotExists(userWoundImageDir);

// ฟังก์ชันกำหนดการตั้งค่า multer ตามประเภทของภาพ
const getMulterStorage = (folder: string) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, folder);
    },
    filename: (req, file, cb) => {
      const fileExtension = file.mimetype.split("/")[1];
      cb(null, `${Date.now()}_image.${fileExtension}`);
    },
  });
};

// กำหนดตัวเลือกของ multer พร้อมการตั้งค่าขนาดไฟล์สูงสุดและการกรองประเภทไฟล์
const multerOptions = (folder: string) => {
  return {
    storage: getMulterStorage(folder),
    limits: { fileSize: 15 * 1024 * 1024 }, // Limit file size to 15 MB
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
export const profileImageUpload = multer(multerOptions(profileImageDir));
export const userWoundImageUpload = multer(multerOptions(userWoundImageDir));
