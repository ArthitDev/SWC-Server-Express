// src/middlewares/uploadMiddleware.ts
import { Request, Response, NextFunction } from "express";
import {
  woundImageUpload,
  articleImageUpload,
  profileImageUpload,
} from "../config/multerConfig";


// Middleware สำหรับอัปโหลดรูปภาพ wound
export const uploadWoundImage = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const upload = woundImageUpload.array("images", 6);

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

// Middleware สำหรับอัปโหลดรูปภาพ profile
export const uploadProfileImage = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const upload = profileImageUpload.single("profileImage");

  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: `Multer error: ${err.message}` });
    }
    next();
  });
};
