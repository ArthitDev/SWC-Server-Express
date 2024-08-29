import express from "express";
import { ArticleTopController } from "../controllers/articleTopController";

const router = express.Router();
const articleTopController = new ArticleTopController();

router.get("/top-articles", articleTopController.getTopArticles);

export default router;
