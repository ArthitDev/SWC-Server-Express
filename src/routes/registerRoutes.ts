import express from "express";
import { registerAdmin } from "../controllers/registerController";

const router = express.Router();

router.post("/register", registerAdmin);

export default router;
