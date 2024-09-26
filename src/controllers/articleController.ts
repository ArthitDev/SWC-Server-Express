import { Request, Response } from "express";
import { getRepository } from "typeorm";
import fs from "fs";
import path from "path";
import { Article } from "../entities/Article";


// ฟังก์ชันสำหรับสร้างข้อมูลบทความพร้อมกับการอัปโหลดรูปภาพ
export const createArticle = async (req: Request, res: Response) => {
  const articleRepository = getRepository(Article);

  try {
    const { article_name, article_content, article_note, ref, category } =
      req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Get the relative path for storing in the database
    const filePath = `article_image/${req.file.filename}`;

    // ตรวจสอบว่า ref เป็น JSON object หรือไม่
    const refObject = ref ? JSON.parse(ref) : null;

    // สร้างข้อมูลบทความและบันทึกลงฐานข้อมูล
    const newArticle = articleRepository.create({
      article_name,
      article_cover: filePath,
      article_content,
      article_note,
      ref: refObject,
      category,
    } as Article);

    await articleRepository.save(newArticle);

    res.status(201).json(newArticle);
  } catch (error) {
    console.error("Error creating article:", error);
    res.status(500).json({ message: "Error creating article", error });
  }
};

// ฟังก์ชันสำหรับอ่านข้อมูลบทความทั้งหมด
export const getAllArticles = async (req: Request, res: Response) => {
  try {
    const articleRepository = getRepository(Article);

    // รับพารามิเตอร์ page, limit, category, และ search จาก query string
    const page = parseInt(req.query.page as string, 10) || 1; // Default หน้า 1
    const limit = parseInt(req.query.limit as string, 10) || 10; // Default 10 รายการต่อหน้า
    const category = req.query.category as string | undefined; // รับ category
    const search = req.query.search as string | undefined; // รับคำค้น (search term)

    // คำนวณค่า offset
    const offset = (page - 1) * limit;

    // ใช้ QueryBuilder เพื่อสร้างคำสั่งค้นหา และเลือกเฉพาะ click_count
    let queryBuilder = articleRepository
      .createQueryBuilder("article")
      .leftJoinAndSelect(
        "article.clicks",
        "article_clicks",
        "article_clicks.click_count"
      )
      .skip(offset)
      .take(limit);

    // ถ้ามี category ให้เพิ่มเงื่อนไขในการค้นหา
    if (category) {
      queryBuilder = queryBuilder.andWhere("article.category = :category", {
        category,
      });
    }

    // ถ้ามีคำค้น (search term) ให้เพิ่มเงื่อนไขในการค้นหาจากหลายคอลัมน์
    if (search) {
      queryBuilder = queryBuilder.andWhere(
        "article.article_name LIKE :search OR article.article_content LIKE :search OR article.article_note LIKE :search",
        { search: `%${search}%` }
      );
    }

    // นับจำนวนทั้งหมดของรายการที่ค้นหาได้
    const [articles, total] = await queryBuilder.getManyAndCount();

    // ตรวจสอบว่ามีบทความหรือไม่
    if (articles.length === 0) {
      return res.status(200).json({ message: "No Articles found" });
    }

    // ส่งข้อมูลกลับไปที่ frontend
    res.status(200).json({
      data: articles.map((article) => ({
        ...article,
        clicks: article.clicks.map((click) => ({
          click_count: click.click_count,
        })),
      })),
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching articles", error });
  }
};



// ฟังก์ชันสำหรับอ่านข้อมูลบทความเฉพาะเจาะจงโดยใช้ ID
export const getArticleById = async (req: Request, res: Response) => {
  try {
    const articleRepository = getRepository(Article);
    const article = await articleRepository.findOne({
      where: { id: parseInt(req.params.id, 10) },
    });

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.status(200).json(article);
  } catch (error) {
    res.status(500).json({ message: "Error fetching article", error });
  }
};

// ฟังก์ชันสำหรับอัปเดตข้อมูลบทความ
export const updateArticle = async (req: Request, res: Response) => {
  try {
    const articleRepository = getRepository(Article);
    const article = await articleRepository.findOne({
      where: { id: parseInt(req.params.id, 10) },
    });

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    const { article_name, article_content, article_note, ref, category } =
      req.body;

    if (category && !["การแพทย์", "เทคโนโลยี", "ทั่วไป"].includes(category)) {
      return res.status(400).json({ message: "Invalid category" });
    }

    article.article_name = article_name ?? article.article_name;
    article.article_content = article_content ?? article.article_content;
    article.article_note = article_note ?? article.article_note;
    article.ref = ref ?? article.ref;

    // ตรวจสอบว่า ref เป็น JSON object หรือไม่
    if (ref) {
      article.ref = JSON.parse(ref);
    }

    if (category) {
      article.category = category;
    }

    if (req.file) {
      // Delete the old file
      if (article.article_cover) {
        const oldFilePath = path.join(
          __dirname,
          "../uploads",
          article.article_cover
        );
        fs.unlink(oldFilePath, (err) => {
          if (err) console.error("Error deleting old file:", err);
        });
      }

      // Update with the new file path
      const filePath = `article_image/${req.file.filename}`;
      article.article_cover = filePath;
    }

    await articleRepository.save(article);
    res.status(200).json(article);
  } catch (error) {
    res.status(500).json({ message: "Error updating article", error });
  }
};


// ฟังก์ชันสำหรับลบข้อมูลบทความ
export const deleteArticle = async (req: Request, res: Response) => {
  try {
    const articleRepository = getRepository(Article);
    const article = await articleRepository.findOne({
      where: { id: parseInt(req.params.id, 10) },
    });

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Delete the image file
    if (article.article_cover) {
      const filePath = path.join(__dirname, "../uploads", article.article_cover);
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }

    await articleRepository.remove(article);
    res.status(200).json({ message: "Article deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting article", error });
  }
};


