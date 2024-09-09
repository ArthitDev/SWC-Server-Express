import { Wound } from './Wound';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from "typeorm";

@Entity("wound_clicks")
export class WoundClick {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Wound, (wound) => wound.clicks)
  @JoinColumn({ name: "wound_id" })
  wound: Wound;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @UpdateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updated_at: Date;

  @Column({ type: "int", default: 0 })
  click_count: number;
}
