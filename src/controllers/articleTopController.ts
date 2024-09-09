import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Article } from "../entities/Article";
import { ArticleClick } from "../entities/Article_Clicks";

export class ArticleTopController {
  public async getTopArticles(req: Request, res: Response): Promise<void> {
    try {
      const topArticles = await getRepository(Article)
        .createQueryBuilder("article")
        .leftJoinAndSelect("article.clicks", "click")
        .select(["article.id", "article.article_name", "click.click_count"])
        .orderBy("click.click_count", "DESC")
        .limit(5)
        .getMany();

      // ดึงค่า click_count จากอาร์เรย์ clicks
      const formattedArticles = topArticles.map((article) => ({
        ...article,
        click_count: article.clicks[0]?.click_count || 0,
      }));

      res.json(formattedArticles);
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
