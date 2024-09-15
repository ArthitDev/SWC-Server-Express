// src/controllers/woundController.ts
import { Request, Response } from "express";
import { Brackets, getRepository } from "typeorm";
import { WoundTypes } from "../entities/Wound_Types";
import { Wound } from "../entities/Wound";
import path from "path";
import fs from "fs";



export const createWound = async (req: Request, res: Response) => {
  const woundRepository = getRepository(Wound);
  const woundTypeRepository = getRepository(WoundTypes);

  try {
    const {
      wound_name, // ใช้ wound_name สำหรับ wound_name_th
      wound_content,
      wound_note,
      wound_name_en, // รับค่า wound_name_en จากฟอร์ม
      ref,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = `wound_image/${req.file.filename}`;
    const refObject = ref ? JSON.parse(ref) : null;

    // สร้างรายการใหม่ใน wound_data
    const newWound = woundRepository.create({
      wound_name,
      wound_cover: filePath,
      wound_content,
      wound_note,
      ref: refObject,
    } as Wound);

    const savedWound = await woundRepository.save(newWound);

    // สร้างรายการใหม่ใน wound_type โดยใช้ wound_name_th และ wound_name_en
    const newWoundType = woundTypeRepository.create({
      wound_name_th: wound_name, // ตั้งค่า wound_name_th ให้เท่ากับ wound_name
      wound_name_en, // ใช้ wound_name_en จากฟอร์ม
      wound: savedWound, // เชื่อมโยงกับข้อมูลใน wound_data
    } as WoundTypes);

    await woundTypeRepository.save(newWoundType);

    res.status(201).json({ wound: savedWound, woundType: newWoundType });
  } catch (error) {
    console.error("Error creating wound:", error);
    res.status(500).json({ message: "Error creating wound", error });
  }
};


export const getAllWounds = async (req: Request, res: Response) => {
  try {
    const woundRepository = getRepository(Wound);

    // รับพารามิเตอร์ page, limit และ search จาก query string
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const search = req.query.search ? (req.query.search as string) : "";

    // คำนวณค่า offset
    const offset = (page - 1) * limit;

    // สร้าง query สำหรับค้นหาข้อมูลจาก wound_data และ wound_type
    const query = woundRepository
      .createQueryBuilder("wound")
      .leftJoinAndSelect("wound.types", "woundTypes") // JOIN กับตาราง wound_type
      .skip(offset)
      .take(limit);

    // ตรวจสอบว่ามีพารามิเตอร์ search หรือไม่
    if (search) {
      query
        .where(
          "wound.wound_name LIKE :search OR wound.wound_content LIKE :search",
          { search: `%${search}%` }
        )
        .addSelect(
          `CASE
        WHEN wound.wound_name LIKE :search THEN 1
        ELSE 2
       END`,
          "priority"
        )
        .orderBy("priority", "ASC") // จัดลำดับให้ wound_name มาเป็นลำดับแรก
        .addOrderBy("wound.wound_name", "ASC") // จัดเรียงเพิ่มเติมตามชื่อถ้าพบ
        .addOrderBy("wound.wound_content", "ASC"); // จากนั้นค่อยเรียงตามเนื้อหา
    }


    // ดึงข้อมูลจากฐานข้อมูล
    const [wounds, total] = await query.getManyAndCount();

    if (wounds.length === 0) {
      return res.status(200).json({ message: "No wounds found" });
    }

    // ส่งข้อมูล wound พร้อมข้อมูลจาก wound_type กลับไป
    res.status(200).json({
      data: wounds.map((wound) => ({
        id: wound.id,
        wound_name: wound.wound_name,
        wound_name_en: wound.types[0]?.wound_name_en || "", // ดึง wound_name_en จาก wound_type
        wound_content: wound.wound_content,
        wound_note: wound.wound_note,
        wound_cover: wound.wound_cover,
        created_at: wound.created_at,
        updated_at: wound.updated_at,
        ref: wound.ref,
      })),
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching wounds:", error);
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

export const updateWound = async (req: Request, res: Response) => {
  const woundRepository = getRepository(Wound);
  const woundTypeRepository = getRepository(WoundTypes);

  try {
    const wound = await woundRepository.findOne({
      where: { id: parseInt(req.params.id, 10) },
    });

    if (!wound) {
      return res.status(404).json({ message: "Wound not found" });
    }

    const {
      wound_name, // ข้อมูลชื่อแผลจากฟอร์ม (ภาษาไทย)
      wound_content,
      wound_note,
      wound_name_en, // ข้อมูลชื่อแผลจากฟอร์ม (ภาษาอังกฤษ)
      ref,
    } = req.body;

    // อัปเดตข้อมูล wound_data
    wound.wound_name = wound_name ?? wound.wound_name; // อัปเดต wound_name
    wound.wound_content = wound_content ?? wound.wound_content;
    wound.wound_note = wound_note ?? wound.wound_note;
    wound.ref = ref ? JSON.parse(ref) : wound.ref;

    if (req.file) {
      const oldFilePath = path.join(__dirname, "../uploads", wound.wound_cover);
      fs.unlink(oldFilePath, (err) => {
        if (err) console.error("Error deleting old file:", err);
      });
      const filePath = `wound_image/${req.file.filename}`;
      wound.wound_cover = filePath;
    }

    await woundRepository.save(wound);

    // ค้นหา wound_type ที่เชื่อมโยงกับ wound_data ผ่าน wound_data_id
    let woundType = await woundTypeRepository.findOne({
      where: { wound: { id: wound.id } }, // ค้นหาผ่าน id ของ wound_data
    });

    // ถ้าพบข้อมูล wound_type ที่เชื่อมโยงกับ wound_data
    if (woundType) {
      // อัปเดต wound_type
      woundType.wound_name_th = wound_name ?? woundType.wound_name_th;
      woundType.wound_name_en = wound_name_en ?? woundType.wound_name_en;
    } else {
      // หากไม่มี wound_type ให้สร้างใหม่
      woundType = woundTypeRepository.create({
        wound_name_th: wound_name, // ใช้ wound_name เป็น wound_name_th (ภาษาไทย)
        wound_name_en: wound_name_en, // ใช้ wound_name_en
        wound: wound, // เชื่อมโยงกับ wound_data
      });
    }

    // บันทึกข้อมูล wound_type
    await woundTypeRepository.save(woundType);

    res.status(200).json({ wound, woundType });
  } catch (error) {
    res.status(500).json({ message: "Error updating wound", error });
  }
};


// Function to delete a wound entry
export const deleteWound = async (req: Request, res: Response) => {
  const woundRepository = getRepository(Wound);

  try {
    const wound = await woundRepository.findOne({
      where: { id: parseInt(req.params.id, 10) },
    });

    if (!wound) {
      return res.status(404).json({ message: "Wound not found" });
    }

    // ลบไฟล์รูปภาพถ้ามี
    if (wound.wound_cover) {
      const filePath = path.join(__dirname, "../uploads", wound.wound_cover);
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }

    // ลบข้อมูล wound_data (และ wound_type ด้วยการ cascade)
    await woundRepository.remove(wound);

    res
      .status(200)
      .json({ message: "Wound and related data deleted successfully" });
  } catch (error) {
    console.error("Error deleting wound:", error);
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
      .leftJoinAndSelect("wound.types", "woundType")
      .select(["wound.id", "wound.wound_name", "wound.wound_cover"])
      .where(
        new Brackets((qb) => {
          qb.where("woundType.wound_name_th IN (:...wound_types)", {
            wound_types,
          }).orWhere("woundType.wound_name_en IN (:...wound_types)", {
            wound_types,
          });
        })
      )
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
