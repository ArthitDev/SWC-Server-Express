import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload, TokenExpiredError } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "your_refresh_token_secret";

export interface CustomRequest extends Request {
  user?: JwtPayload & { id: number; username: string };
}

export const authenticateToken = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Response | void => {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  if (!accessToken && !refreshToken) {
    console.log("Both access and refresh tokens are missing:", req.cookies);
    return res.status(401).json({ message: "No tokens provided" });
  }

  if (accessToken) {
    try {
      const user = jwt.verify(accessToken, JWT_SECRET) as JwtPayload & {
        id: number;
        username: string;
      };
      req.user = user;
      return next();
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        console.log("Access token expired:", err);
      } else {
        console.error("Access token verification failed:", err);
      }
      res.clearCookie("accessToken", { path: "/" });
      res.clearCookie("refreshToken", { path: "/" });
    }
  }

  if (refreshToken) {
    try {
      const user = jwt.verify(
        refreshToken,
        REFRESH_TOKEN_SECRET
      ) as JwtPayload & { id: number; username: string };
      req.user = user;
      const newAccessToken = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 3600000, // 1 hour
      });

      return next();
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        console.error("Refresh token expired:", err);
        return res.status(403).json({ message: "Refresh token expired" });
      } else {
        console.error("Refresh token verification failed:", err);
        res.clearCookie("accessToken", { path: "/" });
        res.clearCookie("refreshToken", { path: "/" });
        return res.status(403).json({ message: "Invalid refresh token" });
      }
    }
  }

  return res
    .status(401)
    .json({ message: "Access token missing, refresh required" });
};
