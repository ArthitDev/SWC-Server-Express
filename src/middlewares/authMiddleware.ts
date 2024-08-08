import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

export interface CustomRequest extends Request {
  user?: JwtPayload;
}

interface JwtPayload {
  id: number;
  username: string;
}

export const authenticateToken = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.accessToken;

  if (!token) {
    console.log("Token is missing:", req.cookies);
    return res.status(401).json({ message: "Token is missing" });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = user;
    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    return res.status(403).json({ message: "Invalid token" });
  }
};
