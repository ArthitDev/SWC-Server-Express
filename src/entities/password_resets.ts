import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { Admin } from "./Admin";

@Entity("password_resets")
export class PasswordReset {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Admin)
  @JoinColumn({ name: "admin_id" })
  admin: Admin;

  @Column()
  token: string;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @Column({ type: "timestamp" })
  expires_at: Date;
}
