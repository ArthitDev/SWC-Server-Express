import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "contact_data" })
export class Contact {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "contact_name", type: "varchar", length: 255 })
  contact_name: string;

  @Column({ name: "contact_email", type: "varchar", length: 255 })
  contact_email: string;

  @Column({ name: "contact_message", type: "text" })
  contact_message: string;

  @Column({ name: "contact_subject", type: "varchar", length: 255 })
  contact_subject: string;

  @Column({ name: "is_read", type: "tinyint", default: false })
  isRead: number;

  @CreateDateColumn({
    name: "created_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: "updated_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;
}
