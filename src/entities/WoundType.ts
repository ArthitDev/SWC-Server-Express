import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Wound } from "./Wound";

@Entity()
export class WoundType {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Wound) 
  @JoinColumn({ name: "wound_data_id" })
  wound_data: Wound;

  @Column()
  type_name_th: string;

  @Column()
  type_name_en: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updated_at: Date;
}
