import express, { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import bodyParser from "body-parser";
import rateLimit from "express-rate-limit";
import compression from "compression";
import morgan from "morgan";
import cron from "node-cron";
import axios from "axios";
import { connect } from "./db";
import { getMainInfo } from "./routes";

// นำเข้าเส้นทาง
import registerRoutes from "./routes/registerRoutes";
import loginRoutes from "./routes/loginRoutes";
import adminProtectedRoutes from "./routes/protectedRoutes";
import refreshTokenRoutes from "./routes/refreshTokenRoutes";
import logoutRoutes from "./routes/logoutRoutes";
import profileRoutes from "./routes/profileRoutes";
import passwordResetRouter from "./routes/passwordResetRoutes";

dotenv.config();

const app = express();
const port = process.env.PORT || 3306;

// เชื่อมต่อฐานข้อมูล
connect();

// ตั้งค่ากลางสำหรับ rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 นาที
//   max: 100, // จำกัดแต่ละ IP ให้สามารถร้องขอได้ไม่เกิน 100 ครั้งต่อ 15 นาที
//   message: "ร้องขอมากเกินไปจาก IP นี้ กรุณาลองใหม่ภายหลัง.",
// });

// นำ rate limiting middleware ไปใช้กับทุกคำร้องขอ
// app.use(limiter);

// ตั้งค่า middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3900",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(helmet());
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
app.use("/api", passwordResetRouter);

// middleware สำหรับจัดการข้อผิดพลาดกลาง
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// ตั้งเวลาเพื่อร้องขอไปยัง keep-alive endpoint เป็นระยะ ๆ
cron.schedule("*/10 * * * *", async () => {
  try {
    await axios.get("http://localhost:3000/keep-alive");
    console.log("Sedning Keep-Alive....");
  } catch (error) {
    console.error("Error Cannot Send Keep-Alive", error);
  }
});

// เริ่มต้นเซิร์ฟเวอร์
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
