import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { google } from "googleapis";
import multer from "multer";
import path from "path";
import fs from "fs";
import { Article } from "../entities/Article";

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
export const createArticle = async (req: Request, res: Response) => {
  const articleRepository = getRepository(Article);

  try {
    const { article_name, author_name, article_content, ref } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = req.file.path;
    const folderId = "1hTIuFrQ1TTZmLCUeplh8ZR9adXgBKRJx";

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

    // สร้างข้อมูลบทความและบันทึกลงฐานข้อมูล
    const newArticle = articleRepository.create({
      article_name,
      author_name,
      article_cover: response.data.id,
      article_content,
      ref,
    } as Article);

    await articleRepository.save(newArticle);

    res.status(201).json(newArticle);
  } catch (error) {
    res.status(500).json({ message: "Error creating wound", error });
  }
};

// ฟังก์ชันสำหรับอ่านข้อมูลบทความทั้งหมด
export const getAllArticles = async (req: Request, res: Response) => {
  try {
    const articleRepository = getRepository(Article);
    const articles = await articleRepository.find();
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

    // อัปเดตรูปภาพถ้ามีการอัปโหลดใหม่
    if (req.file) {
      const filePath = req.file.path;
      const folderId = "1hTIuFrQ1TTZmLCUeplh8ZR9adXgBKRJx";

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
        article.article_cover = response.data.id;
      } else {
        res.status(500).json({ message: "Error: File ID is undefined" });
        return;
      }
    }
    await articleRepository.save(article);
    res.status(200).json(article);
  } catch (error) {
    res.status(500).json({ message: "Error updating article", error });
  }
};

// ฟังก์ชันสำหรับลบข้อมูลแผล
export const deleteArticle = async (req: Request, res: Response) => {
  try {
    const articleRepository = getRepository(Article);
    const article = await articleRepository.findOne({
      where: { id: parseInt(req.params.id, 10) },
    });

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // ลบไฟล์รูปภาพจาก Google Drive
    if (article.article_cover) {
      await drive.files.delete({
        fileId: article.article_cover,
      });
    }

    await articleRepository.remove(article);
    res.status(200).json({ message: "Article deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting article", error });
  }
};

// Middleware สำหรับการอัปโหลดไฟล์
export const uploadMiddleware = upload.single("image");
