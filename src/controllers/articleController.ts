import { Request, Response } from "express";
import { getRepository } from "typeorm";
import fs from "fs";
import path from "path";
import { Article } from "../entities/Article";


// ฟังก์ชันสำหรับสร้างข้อมูลบทความพร้อมกับการอัปโหลดรูปภาพ
export const createArticle = async (req: Request, res: Response) => {
  const articleRepository = getRepository(Article);

  try {
    const { article_name, author_name, article_content, ref } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Get the relative path for storing in the database
    const filePath = `article_image/${req.file.filename}`;


    // สร้างข้อมูลบทความและบันทึกลงฐานข้อมูล
    const newArticle = articleRepository.create({
      article_name,
      author_name,
      article_cover: filePath,
      article_content,
      ref,
    } as Article);

    await articleRepository.save(newArticle);

    res.status(201).json(newArticle);
  } catch (error) {
    console.error("Error creating wound:", error);
    res.status(500).json({ message: "Error creating article", error });
  }
};

// ฟังก์ชันสำหรับอ่านข้อมูลบทความทั้งหมด
export const getAllArticles = async (req: Request, res: Response) => {
  try {
    const articleRepository = getRepository(Article);
    const articles = await articleRepository.find();

    if (articles.length === 0) {
      return res.status(200).json({ message: "No Articles found" });
    }

    res.status(200).json(articles);
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

    const { article_name, author_name, article_content, ref } = req.body;

    article.article_name = article_name ?? article.article_name;
    article.author_name = author_name ?? article.author_name;
    article.article_content = article_content ?? article.article_content;
    article.ref = ref ?? article.ref;

    if (req.file) {
      // Delete the old file
      if (article.article_cover) {
        const oldFilePath = path.join(
          __dirname,
          "../../uploads",
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
      const filePath = path.join(__dirname, "../../uploads", article.article_cover);
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


