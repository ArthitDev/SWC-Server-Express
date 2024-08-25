import rateLimit from "express-rate-limit";

export const useRateLimitDefault = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 นาที
  max: 10, // จำกัดคำขอได้สูงสุด 10 ครั้งต่อ IP ในช่วงเวลาที่กำหนด
  message: "Too many requests, please try again later.",
});

export const useRateLimitCreate = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 นาที
  max: 10, // จำกัดคำขอได้สูงสุด 10 ครั้งต่อ IP ในช่วงเวลาที่กำหนด
  message: "Too many requests, please try again later.",
});

