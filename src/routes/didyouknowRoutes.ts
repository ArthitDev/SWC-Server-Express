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

router.post("/didyouknows", authenticateToken ,createDidyouknow);
router.get("/didyouknows", getAllDidyouknow);
router.get("/didyouknows/:id", getDidyouknowById);
router.put("/didyouknows/:id", authenticateToken,updateDidyouknow);
router.delete("/didyouknows/:id", authenticateToken ,deleteDidyouknow);

export default router;
