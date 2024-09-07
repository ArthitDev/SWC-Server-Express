import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { ArticleClick } from "../entities/Article_Clicks";
import { Article } from "../entities/Article";

export const articleClick = async (req: Request, res: Response) => {
  const { articleId } = req.params;
  const { click_count } = req.body;

  // ตรวจสอบว่า articleId เป็นตัวเลขหรือไม่
  if (!articleId || isNaN(parseInt(articleId, 10))) {
    return res.status(400).json({ message: "Invalid article ID" });
  }

  try {
    const articleRepository = getRepository(Article);
    const clickRepository = getRepository(ArticleClick);

    const articleIdNumber = parseInt(articleId, 10);

    // ตรวจสอบว่ามี Article ที่มี articleId นี้หรือไม่
    const article = await articleRepository.findOne({
      where: { id: articleIdNumber },
    });

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // ตรวจสอบว่ามี record ใน ArticleClick ที่ตรงกับ article_id หรือไม่
    let click = await clickRepository.findOne({
      where: { article: { id: articleIdNumber } },
    });

    if (click) {
      // ถ้ามี record อยู่แล้ว ให้เพิ่มค่า click_count เข้าไป
      click.click_count += click_count || 0;
    } else {
      // ถ้าไม่มี record ให้สร้างใหม่และตั้งค่า click_count เริ่มต้น
      click = new ArticleClick();
      click.article = article;
      click.click_count = click_count || 0;
    }

    // บันทึกข้อมูลการคลิกกลับไปยังฐานข้อมูล
    await clickRepository.save(click);

    return res
      .status(200)
      .json({ message: "Click count updated successfully", click });
  } catch (error) {
    console.error("Error tracking click:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};
