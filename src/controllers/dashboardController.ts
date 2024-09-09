import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Wound } from "../entities/Wound";
import { Article } from "../entities/Article";
import { DidYouKnow } from "../entities/Didyouknow";
import { Trick } from "../entities/Trick";

// ฟังก์ชันดึงข้อมูลจำนวนของ wound, article, didYouKnow และ trick
export const getDashboardData = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // รันคำสั่งทั้งหมดพร้อมกันเพื่อเพิ่มประสิทธิภาพ
    const [woundCount, articleCount, didYouKnowCount, trickCount] =
      await Promise.all([
        getRepository(Wound).count(),
        getRepository(Article).count(),
        getRepository(DidYouKnow).count(),
        getRepository(Trick).count(),
      ]);

    // รวมข้อมูลทั้งหมดในวัตถุเดียว
    const dashboardData = {
      woundCount,
      articleCount,
      didYouKnowCount,
      trickCount,
    };

    // ส่งข้อมูลกลับ
    return res.status(200).json(dashboardData);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
};

// ฟังก์ชันดึงบทความทั้งหมดพร้อมข้อมูลการคลิก
export const getAllArticlesWithClicks = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // ดึงข้อมูลบทความทั้งหมดพร้อมจำนวนคลิก
    const articles = await getRepository(Article)
      .createQueryBuilder("article")
      .leftJoinAndSelect("article.clicks", "click")
      .select(["article.id", "article.article_name", "click.click_count"])
      .orderBy("click.click_count", "DESC")
      .getMany();

    // จัดรูปแบบข้อมูลเพื่อให้ไม่เกิดการซ้ำซ้อนของ click_count
    const formattedArticles = articles.map((article) => ({
      id: article.id,
      article_name: article.article_name,
      click_count: article.clicks[0]?.click_count || 0, // รวมเฉพาะ click_count ไม่ดึง clicks มาแสดง
    }));

    // ส่งข้อมูลบทความพร้อมกับ click_count กลับไปที่ client
    return res.status(200).json(formattedArticles);
  } catch (error) {
    console.error("Error fetching all articles with clicks:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch articles with clicks" });
  }
};

export const getAllWoundsWithClicks = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // ดึงข้อมูลบาดแผลทั้งหมดพร้อมจำนวนคลิกและ created_at, updated_at
    const wounds = await getRepository(Wound)
      .createQueryBuilder("wound")
      .leftJoinAndSelect("wound.clicks", "click")
      .select([
        "wound.id",
        "wound.wound_name",
        "wound.created_at",
        "wound.updated_at",
        "click.click_count",
      ])
      .orderBy("click.click_count", "DESC")
      .getMany();

    const formattedWounds = wounds.map((wound) => ({
      id: wound.id,
      wound_name: wound.wound_name,
      created_at: wound.created_at, // เพิ่ม created_at เพื่อใช้ใน chart
      updated_at: wound.updated_at, // เพิ่ม updated_at เพื่อใช้ใน chart
      click_count: wound.clicks[0]?.click_count || 0,
    }));

    // ส่งข้อมูลบาดแผลพร้อมกับ click_count และ created_at, updated_at กลับไปที่ client
    return res.status(200).json(formattedWounds);
  } catch (error) {
    console.error("Error fetching all wounds with clicks:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch wounds with clicks" });
  }
};
