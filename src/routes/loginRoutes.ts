import express from "express";
import { loginAdmin } from "../controllers/loginController";

const router = express.Router();

router.post("/login", loginAdmin);

export default router;
