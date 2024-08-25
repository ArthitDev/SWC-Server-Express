import { Router } from "express";
import {
  createTrick,
  getAllTricks,
  getTrickById,
  updateTrick,
  deleteTrick,
} from "../controllers/trickController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();

router.post("/tricks", authenticateToken ,createTrick);
router.get("/tricks", getAllTricks);
router.get("/tricks/:id", getTrickById);
router.put("/tricks/:id", authenticateToken ,updateTrick);
router.delete("/tricks/:id", authenticateToken ,deleteTrick);

export default router;
