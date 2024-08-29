// src/middlewares/uploadMiddleware.ts
import { Request, Response, NextFunction } from "express";
import { woundImageUpload, articleImageUpload } from "../config/multerConfig";

// Middleware สำหรับอัปโหลดรูปภาพ wound
export const uploadWoundImage = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const upload = woundImageUpload.single("image");

  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: `Multer error: ${err.message}` });
    }
    next();
  });
};

// Middleware สำหรับอัปโหลดรูปภาพ article
export const uploadArticleImage = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const upload = articleImageUpload.single("image");

  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: `Multer error: ${err.message}` });
    }
    next();
  });
};
