import { Router } from "express";
import { PasswordResetService } from "../services/passwordResetService";

const router = Router();
const passwordResetService = new PasswordResetService();

router.post("/request-reset-password", async (req, res) => {
  const { email } = req.body;

  try {
    await passwordResetService.requestResetPassword(email);
    res.status(200).send("Password reset link has been sent to your email");
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).send(error.message);
    } else {
      res.status(400).send("An unknown error occurred");
    }
  }
});

router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    await passwordResetService.resetPassword(token, newPassword);
    res.status(200).send("Password has been reset successfully");
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).send(error.message);
    } else {
      res.status(400).send("An unknown error occurred");
    }
  }
});

export default router;
