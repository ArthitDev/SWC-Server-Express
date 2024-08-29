import { ArticleClick } from "./Article_Clicks";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";

@Entity("article_data")
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => ArticleClick, (click) => click.article)
  clicks: ArticleClick[];
  
  @Column({ type: "varchar", length: 150 })
  article_name: string;

  @Column({ type: "varchar", length: 50 })
  author_name: string;

  @Column({ type: "longtext" })
  article_cover: string;

  @Column({ type: "longtext" })
  article_content: string;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @UpdateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updated_at: Date;

  @Column({ type: "text", nullable: true })
  ref: string;
}
