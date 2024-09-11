import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Wound } from "./Wound";

@Entity("wound_type")
export class WoundTypes {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Wound, (wound) => wound.types)
  @JoinColumn({ name: "wound_data_id" }) // ระบุชื่อคอลัมน์ Foreign Key
  wound: Wound;

  @Column({ type: "varchar", length: 150 })
  wound_name_th: string;

  @Column({ type: "varchar", length: 150 })
  wound_name_en: string;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @UpdateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updated_at: Date;
}
