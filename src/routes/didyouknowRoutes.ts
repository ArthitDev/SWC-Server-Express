import { Router } from "express";
import {
  createDidyouknow,
  getAllDidyouknow,
  getDidyouknowById,
  updateDidyouknow,
  deleteDidyouknow,
} from "../controllers/didyouknowController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();

router.post("/didyouknow", authenticateToken ,createDidyouknow);
router.get("/didyouknow", getAllDidyouknow);
router.get("/didyouknow/:id", getDidyouknowById);
router.put("/didyouknow/:id", authenticateToken,updateDidyouknow);
router.delete("/didyouknow/:id", authenticateToken ,deleteDidyouknow);

export default router;
