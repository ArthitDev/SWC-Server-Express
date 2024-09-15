import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { DidYouKnow } from "./../entities/Didyouknow";

// Create a new Didyouknow
export const createDidyouknow = async (req: Request, res: Response) => {
  try {
    const didyouknowRepository = getRepository(DidYouKnow);
    const newDidyouknow = didyouknowRepository.create(req.body);
    const savedDidyouknow = await didyouknowRepository.save(newDidyouknow);
    res.status(201).json(savedDidyouknow);
  } catch (error) {
    res.status(500).json({ message: "Error creating Didyouknow", error });
  }
};

// Get all Didyouknow
export const getAllDidyouknow = async (req: Request, res: Response) => {
  try {
    const didyouknowRepository = getRepository(DidYouKnow);

    // รับพารามิเตอร์ page, limit และ search จาก query string
    const page = req.query.page
      ? parseInt(req.query.page as string, 10)
      : undefined;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : undefined;
    const search = req.query.search ? (req.query.search as string) : "";

    // สร้าง QueryBuilder
    const queryBuilder = didyouknowRepository.createQueryBuilder("didyouknow");

    // ถ้ามีการค้นหา ให้เพิ่มเงื่อนไขการค้นหา
    if (search) {
      queryBuilder.where(
        "didyouknow.didyouknow_name LIKE :search OR didyouknow.didyouknow_content LIKE :search",
        { search: `%${search}%` }
      );
    }

    // จัดการ pagination
    if (page && limit) {
      const offset = (page - 1) * limit;
      queryBuilder.skip(offset).take(limit);
    }

    // ดึงข้อมูลพร้อมนับจำนวนทั้งหมด
    const [didyouknows, total] = await queryBuilder.getManyAndCount();

    if (didyouknows.length === 0) {
      return res.status(200).json({ message: "No DidYouKnow found" });
    }

    res.status(200).json({
      data: didyouknows,
      totalItems: total,
      totalPages: page && limit ? Math.ceil(total / limit) : 1,
      currentPage: page || 1,
    });
  } catch (error) {
    console.error("Error fetching DidYouKnow:", error);
    res.status(500).json({ message: "Error fetching DidYouKnow", error });
  }
};


// Get a Didyouknow by ID
export const getDidyouknowById = async (req: Request, res: Response) => {
  try {
    const didyouknowRepository = getRepository(DidYouKnow);
    const didyouknow = await didyouknowRepository.findOne({
      where: { id: parseInt(req.params.id) },
    });
    if (!didyouknow) {
      return res.status(404).json({ message: "Didyouknow not found" });
    }
    res.status(200).json(didyouknow);
  } catch (error) {
    res.status(500).json({ message: "Error fetching didyouknow", error });
  }
};

// Update a Didyouknow by ID
export const updateDidyouknow = async (req: Request, res: Response) => {
  try {
    const didyouknowRepository = getRepository(DidYouKnow);
    const didyouknow = await didyouknowRepository.findOne({
      where: { id: parseInt(req.params.id) },
    });
    if (!didyouknow) {
      return res.status(404).json({ message: "Didyouknow not found" });
    }
    Object.assign(didyouknow, req.body);
    const updatedDidyouknow = await didyouknowRepository.save(didyouknow);
    res.status(200).json(updatedDidyouknow);
  } catch (error) {
    res.status(500).json({ message: "Error updating didyouknow", error });
  }
};

// Delete a Didyouknow by ID
export const deleteDidyouknow = async (req: Request, res: Response) => {
  try {
    const didyouknowRepository = getRepository(DidYouKnow);
    const result = await didyouknowRepository.delete(parseInt(req.params.id));
    if (result.affected === 0) {
      return res.status(404).json({ message: "Didyouknow not found" });
    }
    res.status(204).json({ message: "Didyouknow deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting didyouknow", error });
  }
};

