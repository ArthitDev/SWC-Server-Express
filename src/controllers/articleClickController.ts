import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { ArticleClick } from "../entities/Article_Clicks";
import { Article } from "../entities/Article";

export const articleClick = async (req: Request, res: Response) => {
  const { articleId } = req.params;
  const { click_count } = req.body;

  // ตรวจสอบว่า articleId เป็นตัวเลขหรือไม่
  if (!articleId || isNaN(parseInt(articleId, 10))) {
    return res.status(400).json({ message: "Invalid article ID" });
  }

  try {
    const articleRepository = getRepository(Article);
    const clickRepository = getRepository(ArticleClick);

    const articleIdNumber = parseInt(articleId, 10);

    const article = await articleRepository.findOne({
      where: { id: articleIdNumber },
    });

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    let click = await clickRepository.findOne({
      where: { article: article },
    });

    if (click) {
      click.click_count += click_count || 0;
    } else {
      click = new ArticleClick();
      click.article = article;
      click.click_count = click_count || 0;
    }

    await clickRepository.save(click);

    return res
      .status(201)
      .json({ message: "Click tracked successfully", click });
  } catch (error) {
    console.error("Error tracking click:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};
