// routes/logoutRoutes.ts
import express, { Request, Response } from "express";

const router = express.Router();

router.post("/logout", (req: Request, res: Response) => {
  // ลบ accessToken และ refreshToken cookies
  res.clearCookie("accessToken", { path: "/" });
  res.clearCookie("refreshToken", { path: "/" });
  res.status(200).json({ message: "Logged out successfully" });
});

export default router;
