import { Router } from "express";
import {
  createContact,
  getAllContacts,
  getUnreadContacts,
  updateIsRead,
} from "../controllers/contactController";
import WebSocket from "ws";

const router = Router();

const sendWebSocketMessage = (wss: WebSocket.Server, message: string) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};


// เส้นทางสำหรับเพิ่มข้อมูลใหม่
router.post("/contact", async (req, res, next) => {
  try {
    const wss = req.app.get("wss") as WebSocket.Server;
    await createContact(req, res);
    sendWebSocketMessage(
      wss,
      JSON.stringify({ eventType: "UPDATE_CONTACTS", data: "New Contact added" })
    );
  } catch (error) {
    console.error("Error creating contact:", error);
    next(error);
  }
});

// เส้นทางสำหรับดึงข้อมูลที่ยังไม่ได้อ่าน (is_read = 0)
router.get("/contact/unread", getUnreadContacts);

router.get("/contact", getAllContacts);

router.put("/contact/:id", async (req, res, next) => {
  try {
    const wss = req.app.get("wss") as WebSocket.Server;
    await updateIsRead(req, res);
    sendWebSocketMessage(
      wss,
      JSON.stringify({
        eventType: "UPDATE_CONTACTS",
        data: "Contact Update",
      })
    );
  } catch (error) {
    console.error("Error Update contact:", error);
    next(error);
  }
});

export default router;
