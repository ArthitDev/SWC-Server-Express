import { Router } from "express";
import {
  createArticle,
  getAllArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
} from "../controllers/articleController";
import { authenticateToken } from "../middlewares/authMiddleware";
import { uploadArticleImage } from "../middlewares/uploadMiddleware";
import WebSocket from "ws";

const router = Router();

const sendWebSocketMessage = (wss: WebSocket.Server, message: string) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

router.post(
  "/articles",
  uploadArticleImage,
  authenticateToken,
  async (req, res, next) => {
    try {
      const wss = req.app.get("wss") as WebSocket.Server;
      await createArticle(req, res);
      sendWebSocketMessage(
        wss,
        JSON.stringify({ eventType: "UPDATE_ARTICLES", data: "New article added" })
      );
    } catch (error) {
      console.error("Error creating article:", error);
      next(error);
    }
  }
);
router.get("/articles", getAllArticles);
router.get("/articles/:id", getArticleById);
router.put(
  "/articles/:id",
  uploadArticleImage,
  authenticateToken,
  async (req, res, next) => {
    try {
      const wss = req.app.get("wss") as WebSocket.Server;
      await updateArticle(req, res);
      sendWebSocketMessage(
        wss,
        JSON.stringify({ eventType: "UPDATE_ARTICLES", data: "article updated" })
      );
    } catch (error) {
      console.error("Error updating article:", error);
      next(error);
    }
  }
);
router.delete("/articles/:id", authenticateToken, deleteArticle, async (req, res, next) => {
  try {
    const wss = req.app.get("wss") as WebSocket.Server;
    await deleteArticle(req, res);
    sendWebSocketMessage(
      wss,
      JSON.stringify({ eventType: "UPDATE_WOUNDS", data: "Wound deleted" })
    );
  } catch (error) {
    console.error("Error deleting wound:", error);
    next(error);
  }
});


export default router;
