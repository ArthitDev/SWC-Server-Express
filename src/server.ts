import express, { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import bodyParser from "body-parser";
import compression from "compression";
import morgan from "morgan";
import cron from "node-cron";
import axios from "axios";
import { connect } from "./db";
import { getMainInfo } from "./routes";
import http from "http"; 
import WebSocket from "ws"; 

// นำเข้าเส้นทาง
import registerRoutes from "./routes/registerRoutes";
import loginRoutes from "./routes/loginRoutes";
import adminProtectedRoutes from "./routes/protectedRoutes";
import refreshTokenRoutes from "./routes/refreshTokenRoutes";
import logoutRoutes from "./routes/logoutRoutes";
import profileRoutes from "./routes/profileRoutes";
import passwordResetRouter from "./routes/passwordResetRoutes";
import trickRoutes from "./routes/trickRoutes";
import didyouknowRoutes from "./routes/didyouknowRoutes";
import woundRoutes from "./routes/woundRoutes";
import articleRoutes from "./routes/articleRoutes";
import uploadsRoutes from "./routes/uploadsRoutes";
import articleClickRoutes from "./routes/articleClickRoutes";
import woundClickRoutes from "./routes/woundClickRoutes";
import articleTopRoutes from "./routes/articleTopRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import profileSettingRoutes from "./routes/profileSettingRoutes";
import contactRoutes from "./routes/contactRoutes";

if (process.env.NODE_ENV === "production") {
  dotenv.config({ path: ".env.prod" });
  console.log("Environment: Production");
} else {
  dotenv.config({ path: ".env.local" });
  console.log("Environment: Development");
}

const app = express();
const port = process.env.PORT || 3306;
const host = process.env.HOST || "localhost";


// สร้าง HTTP server
const server = http.createServer(app);

// สร้าง WebSocket server และเชื่อมต่อกับ HTTP server
const wss = new WebSocket.Server({ server });


// เชื่อมต่อฐานข้อมูล
connect();

// ตั้งค่า middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3900",
    methods: ["GET", "POST", "PUT", "DELETE" ,"PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "img-src": ["'self'", "data:", "https:", "http:"],
        "script-src": ["'self'", "'unsafe-inline'", "https:", "http:"],
        "style-src": ["'self'", "'unsafe-inline'", "https:", "http:"],
        "connect-src": ["'self'", "http://localhost:3000"],
        "frame-ancestors": ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    referrerPolicy: { policy: "no-referrer" },
    xssFilter: true,
    frameguard: { action: "deny" },
    hidePoweredBy: true,
    hsts: {
      maxAge: 60 * 60 * 24 * 365,
      includeSubDomains: true,
      preload: true,
    },
    ieNoOpen: true,
    noSniff: true,
  })
);
app.use(cookieParser());
app.use(bodyParser.json());
app.use(compression());
app.use(morgan("combined"));

// เส้นทางสำหรับหน้าแรก
app.get("/", getMainInfo);

// เส้นทางสำหรับ keep-alive
app.get("/keep-alive", (req: Request, res: Response) => {
  res.status(200).send("Server is alive");
});

// ใช้เส้นทาง
app.use("/api", registerRoutes);
app.use("/api", loginRoutes);
app.use("/api", refreshTokenRoutes);
app.use("/api", adminProtectedRoutes);
app.use("/api", logoutRoutes);
app.use("/api", profileRoutes);
app.use("/api", profileSettingRoutes);
app.use("/api", passwordResetRouter);

// CRUD
app.use(
  "/api",
  (req, res, next) => {
    req.app.set("wss", wss);
    next();
  },
  woundRoutes
);
app.use(
  "/api",
  (req, res, next) => {
    req.app.set("wss", wss);
    next();
  },
  articleRoutes
);
app.use(
  "/api",
  (req, res, next) => {
    req.app.set("wss", wss);
    next();
  },
  trickRoutes
);
app.use(
  "/api",
  (req, res, next) => {
    req.app.set("wss", wss);
    next();
  },
  didyouknowRoutes
);

// Upload
app.use(
  "/api",
  (req, res, next) => {
    req.app.set("wss", wss);
    next();
  },
  uploadsRoutes
);

//Track Click Article
app.use(
  "/api", articleClickRoutes);
app.use("/api",woundClickRoutes);

//Top Click Article
app.use("/api", articleTopRoutes);

//Dashbord Data
app.use("/api", dashboardRoutes);

app.use("/api" ,contactRoutes);


// middleware สำหรับจัดการข้อผิดพลาดกลาง
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// ตั้งเวลาเพื่อร้องขอไปยัง keep-alive endpoint เป็นระยะ ๆ
cron.schedule("*/25 * * * *", async () => {
  try {
    await axios.get(`${process.env.BASE_URL}/keep-alive`);
    console.log("Sending Keep-Alive....");
  } catch (error) {
    console.error("Error Cannot Send Keep-Alive", error);
  }
});

// เริ่มต้น HTTP และ WebSocket server
server.listen(port, () => {
  console.log(`Server running at http://${host}:${port}`);
});

wss.on("connection", (ws) => {
  console.log("New client connected");

  ws.send(JSON.stringify({ message: "Welcome to WebSocket server!" }));

  ws.on("message", (message) => {
    console.log("Received from client:", message);
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

