import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Wound } from "../entities/Wound";
import { WoundClick } from "../entities/Wound_Clicks";

export const woundClick = async (req: Request, res: Response) => {
  const { woundId } = req.params;
  const { click_count } = req.body;

  // ตรวจสอบว่า wounId เป็นตัวเลขหรือไม่
  if (!woundId || isNaN(parseInt(woundId, 10))) {
    return res.status(400).json({ message: "Invalid article ID" });
  }

  try {
    const woundRepository = getRepository(Wound);
    const clickRepository = getRepository(WoundClick);

    const woundIdNumber = parseInt(woundId, 10);

    // ตรวจสอบว่ามี wound ที่มี woundId นี้หรือไม่
    const wound = await woundRepository.findOne({
      where: { id: woundIdNumber },
    });

    if (!wound) {
      return res.status(404).json({ message: "Wound not found" });
    }

    // ตรวจสอบว่ามี record ใน ArticleClick ที่ตรงกับ article_id หรือไม่
    let click = await clickRepository.findOne({
      where: { wound: { id: woundIdNumber } },
    });

    if (click) {
      // ถ้ามี record อยู่แล้ว ให้เพิ่มค่า click_count เข้าไป
      click.click_count += click_count || 0;
    } else {
      // ถ้าไม่มี record ให้สร้างใหม่และตั้งค่า click_count เริ่มต้น
      click = new WoundClick();
      click.wound = wound;
      click.click_count = click_count || 0;
    }

    // บันทึกข้อมูลการคลิกกลับไปยังฐานข้อมูล
    await clickRepository.save(click);

    return res
      .status(200)
      .json({ message: "Click count updated successfully" });
  } catch (error) {
    console.error("Error tracking click:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};
