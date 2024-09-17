import { getRepository } from "typeorm";
import { Admin } from "../entities/Admin";
import { PasswordReset } from "../entities/password_resets";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export class PasswordResetService {
  async requestResetPassword(adminEmail: string): Promise<void> {
    const adminRepository = getRepository(Admin);
    const passwordResetRepository = getRepository(PasswordReset);

    const admin = await adminRepository.findOne({
      where: { email: adminEmail, is_deleted: 0 }, // เพิ่มเงื่อนไข is_deleted = 0
    });
    if (!admin) {
      throw new Error("ไม่พบบัญชี บัญชีอาจถูกปิดใช้งาน");
    }

    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    const passwordReset = new PasswordReset();
    passwordReset.admin = admin;
    passwordReset.token = token;
    passwordReset.expires_at = expiresAt;

    await passwordResetRepository.save(passwordReset);

    // สร้างลิงก์ reset password
    const resetLink = `${process.env.FRONTEND_URL}/login/reset-password?token=${token}`;

    // Send email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"SWC App" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: "Password Reset Request",
      html: `
    <div style="display: none; max-height: 0px; overflow: hidden; mso-hide: all;">
      You requested a password reset. Please use the following link to reset your password.
    </div>
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Password Reset Request For : ${admin.username}</h2>
      <p>You requested a password reset. Please click the link below to reset your password:</p>
      <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request a password reset, please ignore this email.</p>
      <p>Thank you,<br>The SWC Team</p>
    </div>
  `,
    };

    await transporter.sendMail(mailOptions);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const passwordResetRepository = getRepository(PasswordReset);
    const adminRepository = getRepository(Admin);

    const passwordReset = await passwordResetRepository.findOne({
      where: { token },
      relations: ["admin"], 
    });

    if (!passwordReset || passwordReset.expires_at < new Date()) {
      throw new Error("Token หมดอายุ กรุณาส่งอีเมลใหม่อีกครั้ง");
    }

    const admin = passwordReset.admin;

    // เพิ่มเงื่อนไข is_deleted = 0
    if (admin.is_deleted !== 0) {
      throw new Error("บัญชีถูกลบแล้ว");
    }

    admin.password = await bcrypt.hash(newPassword, 10);

    await adminRepository.save(admin);
    await passwordResetRepository.delete(passwordReset.id);
  }
}
