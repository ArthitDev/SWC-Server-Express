import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Wound } from "../entities/Wound";
import { google } from "googleapis";
import multer from "multer";
import path from "path";
import fs from "fs";

// โหลด API keys และการตั้งค่า Google API
const keysPath = path.join(__dirname, "../apikeys.json");
const apiKeys = JSON.parse(fs.readFileSync(keysPath, "utf8"));

const auth = new google.auth.GoogleAuth({
  keyFile: keysPath,
  scopes: ["https://www.googleapis.com/auth/drive.file"],
});

const drive = google.drive({ version: "v3", auth });

// กำหนด multer สำหรับการจัดการการอัปโหลดไฟล์
const upload = multer({ dest: "uploads/" });

// ฟังก์ชันสำหรับสร้างข้อมูลแผลพร้อมกับการอัปโหลดรูปภาพ
export const createWound = async (req: Request, res: Response) => {
  const woundRepository = getRepository(Wound);

  try {
    const { wound_name, wound_content, ref } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = req.file.path;
    const folderId = "19OUpTIS9m1znsqYBfOWeHCPa9UHaga6T";

    // อัปโหลดไฟล์ไปยัง Google Drive
    const response = await drive.files.create({
      requestBody: {
        name: req.file.originalname,
        mimeType: req.file.mimetype,
        parents: [folderId],
      },
      media: {
        mimeType: req.file.mimetype,
        body: fs.createReadStream(filePath),
      },
    });

    // ลบไฟล์ในระบบหลังจากอัปโหลดเสร็จ
    fs.unlinkSync(filePath);

    // สร้างข้อมูลแผลและบันทึกลงฐานข้อมูล
    const newWound = woundRepository.create({
      wound_name,
      wound_cover: response.data.id,
      wound_content,
      ref,
    } as Wound);

    await woundRepository.save(newWound);

    res.status(201).json(newWound);
  } catch (error) {
    res.status(500).json({ message: "Error creating wound", error });
  }
};

// ฟังก์ชันสำหรับอ่านข้อมูลแผลทั้งหมด
export const getAllWounds = async (req: Request, res: Response) => {
  try {
    const woundRepository = getRepository(Wound);
    const wounds = await woundRepository.find();
    res.status(200).json(wounds);
  } catch (error) {
    res.status(500).json({ message: "Error fetching wounds", error });
  }
};

// ฟังก์ชันสำหรับอ่านข้อมูลแผลเฉพาะเจาะจงโดยใช้ ID
export const getWoundById = async (req: Request, res: Response) => {
  try {
    const woundRepository = getRepository(Wound);
    const wound = await woundRepository.findOne({
      where: { id: parseInt(req.params.id, 10) },
    });

    if (!wound) {
      return res.status(404).json({ message: "Wound not found" });
    }

    res.status(200).json(wound);
  } catch (error) {
    res.status(500).json({ message: "Error fetching wound", error });
  }
};

// ฟังก์ชันสำหรับอัปเดตข้อมูลแผล
export const updateWound = async (req: Request, res: Response) => {
  try {
    const woundRepository = getRepository(Wound);
    const wound = await woundRepository.findOne({
      where: { id: parseInt(req.params.id, 10) },
    });

    if (!wound) {
      return res.status(404).json({ message: "Wound not found" });
    }

    const { wound_name, wound_content, ref } = req.body;

    wound.wound_name = wound_name ?? wound.wound_name;
    wound.wound_content = wound_content ?? wound.wound_content;
    wound.ref = ref ?? wound.ref;

    // อัปเดตรูปภาพถ้ามีการอัปโหลดใหม่
    if (req.file) {
      const filePath = req.file.path;
      const folderId = "19OUpTIS9m1znsqYBfOWeHCPa9UHaga6T";

      // อัปโหลดไฟล์ใหม่ไปยัง Google Drive
      const response = await drive.files.create({
        requestBody: {
          name: req.file.originalname,
          mimeType: req.file.mimetype,
          parents: [folderId],
        },
        media: {
          mimeType: req.file.mimetype,
          body: fs.createReadStream(filePath),
        },
      });

      // ลบไฟล์ในระบบหลังจากอัปโหลดเสร็จ
      fs.unlinkSync(filePath);
      // ตรวจสอบว่า response.data.id ไม่เป็น undefined
      if (response.data.id) {
        wound.wound_cover = response.data.id;
      } else {
        res.status(500).json({ message: "Error: File ID is undefined" });
        return;
      }
    }
    await woundRepository.save(wound);
    res.status(200).json(wound);
  } catch (error) {
    res.status(500).json({ message: "Error updating wound", error });
  }
};

// ฟังก์ชันสำหรับลบข้อมูลแผล
export const deleteWound = async (req: Request, res: Response) => {
  try {
    const woundRepository = getRepository(Wound);
    const wound = await woundRepository.findOne({
      where: { id: parseInt(req.params.id, 10) },
    });

    if (!wound) {
      return res.status(404).json({ message: "Wound not found" });
    }

    // ลบไฟล์รูปภาพจาก Google Drive
    if (wound.wound_cover) {
      await drive.files.delete({
        fileId: wound.wound_cover,
      });
    }

    await woundRepository.remove(wound);
    res.status(200).json({ message: "Wound deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting wound", error });
  }
};

// Middleware สำหรับการอัปโหลดไฟล์
export const uploadMiddleware = upload.single("image");
