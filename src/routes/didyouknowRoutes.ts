import { Router } from "express";
import {
  createDidyouknow,
  getAllDidyouknow,
  getDidyouknowById,
  updateDidyouknow,
  deleteDidyouknow,
} from "../controllers/didyouknowController";

const router = Router();

router.post("/didyouknow", createDidyouknow);
router.get("/didyouknow", getAllDidyouknow);
router.get("/didyouknow/:id", getDidyouknowById);
router.put("/didyouknow/:id", updateDidyouknow);
router.delete("/didyouknow/:id", deleteDidyouknow);

export default router;
