import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { WoundClick } from "./Wound_Clicks";
import { WoundTypes } from "./Wound_Types";
import { WoundCover } from "./Wound_Cover";

@Entity("wound_data")
export class Wound {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => WoundClick, (click) => click.wound)
  clicks: WoundClick[];

  @OneToMany(() => WoundCover, (cover) => cover.wound, {
    cascade: true,
    onDelete: "CASCADE",
  })
  covers: WoundCover[]; // ความสัมพันธ์กับหลายรูปภาพ wound_cover

  @OneToMany(() => WoundTypes, (type) => type.wound, {
    cascade: true,
    onDelete: "CASCADE",
  })
  types: WoundTypes[];

  @Column({ type: "varchar", length: 150 })
  wound_name: string;

  @Column({ type: "longtext" })
  wound_content: string;

  @Column({ type: "longtext" })
  wound_note: string;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @UpdateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updated_at: Date;

  @Column({ type: "json", nullable: true })
  ref: { id: string; value: string }[];

  @Column({ type: "json", nullable: true })
  wound_video: { id: string; value: string }[];
}
