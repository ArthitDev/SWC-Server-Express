import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Wound } from "./Wound";

@Entity("wound_covers") // ชื่อตาราง wound_covers
export class WoundCover {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "longtext" })
  wound_cover: string;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @UpdateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updated_at: Date;

  @ManyToOne(() => Wound, (wound) => wound.covers, {
    onDelete: "CASCADE",
  })
  wound: Wound; 
}
