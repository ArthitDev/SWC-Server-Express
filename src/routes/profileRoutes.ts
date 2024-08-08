import express, { Request, Response } from "express";
import {
  authenticateToken,
  CustomRequest,
} from "../middlewares/authMiddleware";
import { findUserById } from "../services/userService";

const router = express.Router();

router.get(
  "/profile",
  authenticateToken,
  async (req: CustomRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const userId = req.user.id;

    try {
      const user = await findUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
