// src/controllers/woundController.ts
import { Request, Response } from "express";
import { Brackets, getRepository } from "typeorm";
import { WoundTypes } from "../entities/Wound_Types";
import { Wound } from "../entities/Wound";
import { WoundCover } from "../entities/Wound_Cover";
import path from "path";
import { promises as fsPromises } from 'fs'; // ใช้ fs.promises สำหรับ async



export const createWounds = async (req: Request, res: Response) => {
  const woundRepository = getRepository(Wound);
  const woundTypeRepository = getRepository(WoundTypes);
  const woundCoverRepository = getRepository(WoundCover); // เพิ่มการนำเข้า WoundCover Repository

  try {
    const {
      wound_name, // ใช้ wound_name สำหรับ wound_name_th
      wound_content,
      wound_note,
      wound_name_en, // รับค่า wound_name_en จากฟอร์ม
      ref,
      wound_video,
    } = req.body;

    if (!req.files || !Array.isArray(req.files)) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const refObject = ref ? JSON.parse(ref) : null;
    const woundVideoObject = wound_video ? JSON.parse(wound_video) : null;

    // สร้างรายการใหม่ใน wound_data
    const newWound = woundRepository.create({
      wound_name,
      wound_content,
      wound_note,
      ref: refObject,
      wound_video: woundVideoObject, 
    } as Wound);

    const savedWound = await woundRepository.save(newWound);

    // อัปโหลดหลายรูป wound_covers (ใช้ req.files แทน req.file)
    const uploadedFiles = req.files as Express.Multer.File[];
    for (const file of uploadedFiles) {
      const filePath = `wound_image/${file.filename}`;

      // สร้างรายการใหม่ใน wound_covers
      const newWoundCover = woundCoverRepository.create({
        wound: savedWound, // เชื่อมโยงกับข้อมูลใน wound_data
        wound_cover: filePath, // บันทึก path ของรูปภาพ
      });

      await woundCoverRepository.save(newWoundCover); // บันทึกข้อมูลรูปภาพ
    }

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

    // สร้าง query สำหรับค้นหาข้อมูลจาก wound_data, wound_type, wound_clicks, และ wound_covers
    const query = woundRepository
      .createQueryBuilder("wound")
      .leftJoinAndSelect("wound.types", "woundTypes") // JOIN กับตาราง wound_type
      .leftJoinAndSelect("wound.clicks", "woundClicks") // JOIN กับตาราง wound_clicks
      .leftJoinAndSelect("wound.covers", "woundCovers") // JOIN กับตาราง wound_covers เพื่อดึงข้อมูลรูปภาพ
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

    // จัดเรียงข้อมูลตาม click_counts จากมากไปน้อย
    query.addOrderBy("woundClicks.click_count", "DESC");

    // ดึงข้อมูลจากฐานข้อมูล
    const [wounds, total] = await query.getManyAndCount();

    if (wounds.length === 0) {
      return res.status(200).json({ message: "No wounds found" });
    }

    // ส่งข้อมูล wound พร้อมข้อมูลจาก wound_type, wound_clicks และ wound_covers (รูปภาพหลายรูป)
    res.status(200).json({
      data: wounds.map((wound) => ({
        id: wound.id,
        wound_name: wound.wound_name,
        wound_name_en: wound.types[0]?.wound_name_en || "",
        wound_content: wound.wound_content,
        wound_note: wound.wound_note,
        wound_covers: wound.covers.map((cover) => ({
          id: cover.id,
          url: cover.wound_cover,
        })),
        click_counts: wound.clicks.map((click) => click.click_count),
        created_at: wound.created_at,
        updated_at: wound.updated_at,
        ref: wound.ref,
        wound_video: wound.wound_video,
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






export const updateWound = async (req: Request, res: Response) => {
  const woundRepository = getRepository(Wound);
  const woundCoverRepository = getRepository(WoundCover);
  const woundTypeRepository = getRepository(WoundTypes);

  try {
    const wound = await woundRepository.findOne({
      where: { id: parseInt(req.params.id, 10) },
      relations: ["covers"],
    });

    if (!wound) {
      return res.status(404).json({ message: "Wound not found" });
    }

    const {
      wound_name,
      wound_content,
      wound_note,
      wound_name_en,
      ref,
      wound_video,
      removed_images,
    } = req.body;

    if (wound.covers && wound.covers.length > 0) {
      for (const cover of wound.covers) {
        const coverId = cover.id;
        if (removed_images.includes(coverId)) {
          const filePath = path.join(
            __dirname,
            "../uploads",
            cover.wound_cover
          );

          try {
            await fsPromises.unlink(filePath);
          } catch (err) {
            // Handle error silently or log to a file if needed
          }

          // Remove the cover from the wound.covers array
          wound.covers = wound.covers.filter((c) => c.id !== coverId);

          // Delete the cover from the database
          await woundCoverRepository.delete(coverId);
        }
      }
    }

    // อัปโหลดรูปภาพใหม่
    if (req.files && Array.isArray(req.files)) {
      const uploadedFiles = req.files as Express.Multer.File[];
      for (const file of uploadedFiles) {
        const filePath = `wound_image/${file.filename}`;

        const newCover = woundCoverRepository.create({
          wound: wound,
          wound_cover: filePath,
        });

        wound.covers.push(newCover);
      }
    }

    // อัปเดตข้อมูลแผล
    wound.wound_name = wound_name ?? wound.wound_name;
    wound.wound_content = wound_content ?? wound.wound_content;
    wound.wound_note = wound_note ?? wound.wound_note;
    wound.ref = ref ? JSON.parse(ref) : wound.ref;
    wound.wound_video = wound_video ? JSON.parse(wound_video) : wound.wound_video;

    // บันทึกข้อมูลแผลที่อัปเดตพร้อม covers
    await woundRepository.save(wound);

    // ตรวจสอบหรือสร้าง woundType
    let woundType = await woundTypeRepository.findOne({
      where: { wound: { id: wound.id } },
    });

    if (woundType) {
      woundType.wound_name_th = wound_name ?? woundType.wound_name_th;
      woundType.wound_name_en = wound_name_en ?? woundType.wound_name_en;
    } else {
      woundType = woundTypeRepository.create({
        wound_name_th: wound_name,
        wound_name_en: wound_name_en,
        wound: wound,
      });
    }

    await woundTypeRepository.save(woundType);

    res.status(200).json({ wound, woundType });
  } catch (error) {
    res.status(500).json({ message: "Error updating wound", error });
  }
};






// Function to get a specific wound entry by ID
export const getWoundById = async (req: Request, res: Response) => {
  try {
    const woundRepository = getRepository(Wound);

    // ดึงข้อมูล wound โดยใช้ ID และ JOIN กับตารางที่เกี่ยวข้อง
    const wound = await woundRepository
      .createQueryBuilder("wound")
      .leftJoinAndSelect("wound.types", "woundTypes") // JOIN กับตาราง wound_types
      .leftJoinAndSelect("wound.clicks", "woundClicks") // JOIN กับตาราง wound_clicks
      .leftJoinAndSelect("wound.covers", "woundCovers") // JOIN กับตาราง wound_covers เพื่อดึงข้อมูลรูปภาพ
      .where("wound.id = :id", { id: parseInt(req.params.id, 10) })
      .getOne();

    // ตรวจสอบว่าพบข้อมูล wound หรือไม่
    if (!wound) {
      return res.status(404).json({ message: "Wound not found" });
    }

    // ส่งข้อมูล wound พร้อมกับข้อมูลที่เกี่ยวข้อง รวมถึง ID ของรูปภาพ
    res.status(200).json({
      id: wound.id,
      wound_name: wound.wound_name,
      wound_name_en: wound.types[0]?.wound_name_en || "",
      wound_content: wound.wound_content,
      wound_note: wound.wound_note,
      wound_covers: wound.covers.map((cover) => ({
        id: cover.id, // ส่ง ID ของรูปภาพ
        url: cover.wound_cover, // ส่ง URL หรือเส้นทางของรูปภาพ
      })),
      click_counts: wound.clicks.map((click) => click.click_count),
      created_at: wound.created_at,
      updated_at: wound.updated_at,
      ref: wound.ref,
      wound_video: wound.wound_video,
    });
  } catch (error) {
    console.error("Error fetching wound:", error);
    res.status(500).json({ message: "Error fetching wound", error });
  }
};









// Function to delete a wound entry
export const deleteWound = async (req: Request, res: Response) => {
  const woundRepository = getRepository(Wound);
  const woundCoverRepository = getRepository(WoundCover);

  try {
    const wound = await woundRepository.findOne({
      where: { id: parseInt(req.params.id, 10) },
      relations: ["covers"],
    });

    if (!wound) {
      return res.status(404).json({ message: "Wound not found" });
    }

    // ลบไฟล์รูปภาพที่เกี่ยวข้อง
    if (wound.covers && wound.covers.length > 0) {
      for (const cover of wound.covers) {
        const filePath = path.join(__dirname, "../uploads", cover.wound_cover);

        try {
          await fsPromises.unlink(filePath);
        } catch (err) {
          console.error("Error deleting file:", err); // จัดการข้อผิดพลาดที่เกิดขึ้น
        }

        // ลบข้อมูลรูปภาพจากตาราง wound_covers
        await woundCoverRepository.remove(cover);
      }
    }

    await woundRepository.remove(wound);
    res.status(200).json({ message: "ลบรูปภาพและข้อมูลที่เกี่ยวข้องแล้ว" });
  } catch (error) {
    console.error("Error deleting wound:", error);
    res.status(500).json({ message: "Error deleting wound", error });
  }
};



export const getAdditionalData = async (req: Request, res: Response) => {
  try {
    const woundRepository = getRepository(Wound);
    const { wound_types } = req.body; // รับค่า wound_types จาก body ของ POST request

    // ตรวจสอบว่ามีค่า wound_types ที่ถูกต้อง
    if (
      !wound_types ||
      !Array.isArray(wound_types) ||
      wound_types.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Invalid or missing wound_types provided." });
    }

    // สร้าง query โดยใช้ QueryBuilder เพื่อดึงข้อมูลแผลพร้อมข้อมูลรูปภาพที่เกี่ยวข้องจากตาราง wound_covers
    const wounds = await woundRepository
      .createQueryBuilder("wound")
      .leftJoinAndSelect("wound.types", "woundTypes") // JOIN กับตาราง wound_type
      .leftJoinAndSelect("wound.covers", "woundCovers") // JOIN กับตาราง wound_covers เพื่อดึงข้อมูลรูปภาพ
      .select([
        "wound.id",
        "wound.wound_name", // เพิ่ม wound_name ลงใน select
        "woundTypes.wound_name_th", // ดึงข้อมูลประเภทแผลภาษาไทย
        "woundTypes.wound_name_en", // ดึงข้อมูลประเภทแผลภาษาอังกฤษ
        "woundCovers.wound_cover", // ดึงข้อมูลรูปภาพจากตาราง wound_covers
      ])
      .where(
        new Brackets((qb) => {
          qb.where("woundTypes.wound_name_th IN (:...wound_types)", {
            wound_types,
          }).orWhere("woundTypes.wound_name_en IN (:...wound_types)", {
            wound_types,
          });
        })
      )
      .getMany();

    // ตรวจสอบว่าพบข้อมูลหรือไม่
    if (!wounds || wounds.length === 0) {
      return res.status(404).json({
        message: "No additional data found for provided wound types.",
      });
    }

    // ส่งข้อมูลกลับที่ถูกคัดกรองตามที่ต้องการ
    return res.status(200).json(
      wounds.map((wound) => ({
        id: wound.id,
        wound_name: wound.wound_name, // ส่งชื่อแผลกลับ
        wound_covers: wound.covers.map((cover) => cover.wound_cover), // ส่งกลับรูปภาพที่เกี่ยวข้อง
      }))
    );
  } catch (error) {
    console.error("Error fetching additional data:", error);
    return res
      .status(500)
      .json({ message: "Error fetching additional data", error });
  }
};


export const getOnlyWounds = async (req: Request, res: Response) => {
  try {
    const woundRepository = getRepository(Wound);

    // สร้าง query สำหรับดึงเฉพาะ id และชื่อแผล (wound_name)
    const wounds = await woundRepository
      .createQueryBuilder("wound")
      .select(["wound.id", "wound.wound_name"]) // เลือกเฉพาะ id และ wound_name
      .orderBy("wound.wound_name", "ASC") // จัดเรียงข้อมูลตามชื่อแผล
      .getMany();

    if (wounds.length === 0) {
      return res.status(200).json({ message: "No wounds found" });
    }

    // ส่งข้อมูล wound เฉพาะ id และชื่อแผล (wound_name)
    res.status(200).json({
      data: wounds.map((wound) => ({
        id: wound.id,
        wound_name: wound.wound_name,
      })),
    });
  } catch (error) {
    console.error("Error fetching wounds:", error);
    res.status(500).json({ message: "Error fetching wounds", error });
  }
};





