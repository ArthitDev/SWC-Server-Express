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

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  created_at: Date;

  @Column({
    name: "expires_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP + INTERVAL 1 HOUR",
  })
  expires_at: Date;
}
