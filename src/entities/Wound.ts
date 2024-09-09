import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { WoundClick } from "./Wound_Clicks";

@Entity("wound_data")
export class Wound {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => WoundClick, (click) => click.wound)
  clicks: WoundClick[];

  @Column({ type: "varchar", length: 150 })
  wound_name: string;

  @Column({ type: "longtext" })
  wound_cover: string;

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
}
