import { Request, Response } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "your_refresh_token_secret";

interface JwtPayload {
  id: number;
  username: string;
}

export const refreshToken = (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token is missing" });
  }

  try {
    const user = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as JwtPayload;

    const newAccessToken = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000,
    });

    return res
      .status(200)
      .json({ message: "Access token refreshed", accessToken: newAccessToken });
  } catch (error) {
    console.error(error);
    return res.status(403).json({ message: "Invalid refresh token" });
  }
};
