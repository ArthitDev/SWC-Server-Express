import { Router } from "express";
import {
  createWounds,
  getAllWounds,
  getWoundById,
  updateWound,
  deleteWound,
  getAdditionalData,
  getOnlyWounds,
} from "../controllers/woundController";
import { authenticateToken } from "../middlewares/authMiddleware";
import {
  uploadWoundImage,
} from "../middlewares/uploadMiddleware";
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
  "/wounds",
  authenticateToken,
  uploadWoundImage,
  async (req, res, next) => {
    try {
      const wss = req.app.get("wss") as WebSocket.Server;
      await createWounds(req, res);
      sendWebSocketMessage(
        wss,
        JSON.stringify({ eventType: "UPDATE_WOUNDS", data: "New wound added" })
      );
    } catch (error) {
      console.error("Error creating wound:", error);
      next(error);
    }
  }
);


router.get("/wounds", getAllWounds);
router.get("/woundsname",getOnlyWounds)
router.get("/wounds/:id", getWoundById);

router.put(
  "/wounds/:id",
  authenticateToken,
  uploadWoundImage,
  async (req, res, next) => {
    try {
      const wss = req.app.get("wss") as WebSocket.Server;
      await updateWound(req, res);
      sendWebSocketMessage(
        wss,
        JSON.stringify({ eventType: "UPDATE_WOUNDS", data: "Wound updated" })
      );
    } catch (error) {
      console.error("Error updating wound:", error);
      next(error);
    }
  }
);

router.delete("/wounds/:id", authenticateToken, async (req, res, next) => {
  try {
    const wss = req.app.get("wss") as WebSocket.Server; 
    await deleteWound(req, res);
    sendWebSocketMessage(
      wss,
      JSON.stringify({ eventType: "UPDATE_WOUNDS", data: "Wound deleted" })
    );
  } catch (error) {
    console.error("Error deleting wound:", error);
    next(error);
  }
});

router.post("/wounds/type", getAdditionalData);


export default router;
