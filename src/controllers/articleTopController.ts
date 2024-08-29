import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Article } from "../entities/Article";
import { ArticleClick } from "../entities/Article_Clicks";

export class ArticleTopController {
  public async getTopArticles(req: Request, res: Response): Promise<void> {
    try {
      // สร้าง QueryBuilder ด้วย TypeORM
      const topArticles = await getRepository(Article)
        .createQueryBuilder("article")
        .leftJoinAndSelect("article.clicks", "click") // เชื่อมกับความสัมพันธ์ clicks ที่กำหนดไว้ใน Entity
        .select([
          "article.id",
          "article.article_name",
          "click.click_count",
        ])
        .orderBy("click.click_count", "DESC")
        .limit(5)
        .getMany();

      res.json(topArticles);
    } catch (error: unknown) {
      console.error("Error fetching top articles:", error);
      res.status(500).json({
        message: "Error fetching top articles",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

export const articleTopController = new ArticleTopController();
