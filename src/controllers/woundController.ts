// src/controllers/woundController.ts
import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Wound } from "../entities/Wound";
import path from "path";
import fs from "fs";

// Function to create a wound entry with image upload
export const createWound = async (req: Request, res: Response) => {
  const woundRepository = getRepository(Wound);

  try {
    const { wound_name, wound_content, wound_note , ref } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Get the relative path for storing in the database
    const filePath = `wound_image/${req.file.filename}`;

    const refObject = ref ? JSON.parse(ref) : null;

    // Create a new wound entry and save to the database
    const newWound = woundRepository.create({
      wound_name,
      wound_cover: filePath,
      wound_content,
      wound_note,
      ref: refObject,
    } as Wound);

    await woundRepository.save(newWound);

    res.status(201).json(newWound);
  } catch (error) {
    console.error("Error creating wound:", error);
    res.status(500).json({ message: "Error creating wound", error });
  }
};

// Function to get all wound entries with pagination and search functionality
export const getAllWounds = async (req: Request, res: Response) => {
  try {
    const woundRepository = getRepository(Wound);

    // รับพารามิเตอร์ page, limit และ search จาก query string
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const search = req.query.search ? (req.query.search as string) : '';

    // คำนวณค่า offset
    const offset = (page - 1) * limit;

    // สร้าง query สำหรับค้นหาข้อมูล
    const query = woundRepository.createQueryBuilder('wound')
      .skip(offset)
      .take(limit);

    // ตรวจสอบว่ามีพารามิเตอร์ search หรือไม่
    if (search) {
      query.where('wound.wound_name LIKE :search OR wound.wound_content LIKE :search OR wound.wound_note LIKE :search', { search: `%${search}%` });
    }

    // ดึงข้อมูลจากฐานข้อมูล
    const [wounds, total] = await query.getManyAndCount();

    if (wounds.length === 0) {
      return res.status(200).json({ message: "No wounds found" });
    }

    res.status(200).json({
      data: wounds,
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching wounds", error });
  }
};



// Function to get a specific wound entry by ID
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

// Function to update a wound entry
export const updateWound = async (req: Request, res: Response) => {
  try {
    const woundRepository = getRepository(Wound);
    const wound = await woundRepository.findOne({
      where: { id: parseInt(req.params.id, 10) },
    });

    if (!wound) {
      return res.status(404).json({ message: "Wound not found" });
    }

    const { wound_name, wound_content, wound_note, ref } = req.body;
    wound.wound_name = wound_name ?? wound.wound_name;
    wound.wound_content = wound_content ?? wound.wound_content;
    wound.wound_note = wound_note ?? wound.wound_note;
    wound.ref = ref ?? wound.ref;

    // ตรวจสอบว่า ref เป็น JSON object หรือไม่
    if (ref) {
      wound.ref = JSON.parse(ref);
    }

    if (req.file) {
      // Delete the old file
      if (wound.wound_cover) {
        const oldFilePath = path.join(
          __dirname,
          "../uploads",
          wound.wound_cover
        );
        fs.unlink(oldFilePath, (err) => {
          if (err) console.error("Error deleting old file:", err);
        });
      }

      // Update with the new file path
      const filePath = `wound_image/${req.file.filename}`;
      wound.wound_cover = filePath;
    }

    await woundRepository.save(wound);
    res.status(200).json(wound);
  } catch (error) {
    res.status(500).json({ message: "Error updating wound", error });
  }
};

// Function to delete a wound entry
export const deleteWound = async (req: Request, res: Response) => {
  try {
    const woundRepository = getRepository(Wound);
    const wound = await woundRepository.findOne({
      where: { id: parseInt(req.params.id, 10) },
    });

    if (!wound) {
      return res.status(404).json({ message: "Wound not found" });
    }

    // Delete the image file
    if (wound.wound_cover) {
      const filePath = path.join(__dirname, "../uploads", wound.wound_cover);
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }

    await woundRepository.remove(wound);
    res.status(200).json({ message: "Wound deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting wound", error });
  }
};

export const getAdditionalData = async (req: Request, res: Response) => {
  try {
    const woundRepository = getRepository(Wound);
    const { wound_types } = req.body; // รับค่า wound_types จาก body ของ POST request

    // ตรวจสอบว่ามีค่า wound_types หรือไม่
    if (!wound_types || !Array.isArray(wound_types)) {
      return res.status(400).json({ message: "Invalid wound_types provided." });
    }

    // สร้าง query โดยใช้ QueryBuilder เพื่อลดข้อมูลที่ดึงมาเฉพาะฟิลด์ที่ต้องการ
    const wounds = await woundRepository
      .createQueryBuilder("wound")
      .select(["wound.id", "wound.wound_name", "wound.wound_cover"]) // เลือกเฉพาะฟิลด์ที่ต้องการ
      .where("wound.wound_name IN (:...wound_types)", { wound_types }) // ใช้ IN clause กับ wound_types หลายค่า
      .getMany();

    // ตรวจสอบว่าพบข้อมูลหรือไม่
    if (wounds.length === 0) {
      return res
        .status(404)
        .json({ message: "No additional data found for wound types." });
    }

    // ส่งข้อมูลกลับที่ถูกคัดกรองตามที่ต้องการ
    return res.status(200).json(wounds);
  } catch (error) {
    console.error("Error fetching additional data:", error);
    return res
      .status(500)
      .json({ message: "Error fetching additional data", error });
  }
};

