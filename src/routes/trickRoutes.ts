import { Router } from "express";
import {
  createTrick,
  getAllTricks,
  getTrickById,
  updateTrick,
  deleteTrick,
} from "../controllers/trickController";

const router = Router();

router.post("/tricks", createTrick);
router.get("/tricks", getAllTricks);
router.get("/tricks/:id", getTrickById);
router.put("/tricks/:id", updateTrick);
router.delete("/tricks/:id", deleteTrick);

export default router;
