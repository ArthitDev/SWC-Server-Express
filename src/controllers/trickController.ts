import { Request, Response } from "express";
import { getRepository , Like} from "typeorm";
import { Trick } from "../entities/Trick";

// Create a new Trick
export const createTrick = async (req: Request, res: Response) => {
  try {
    const trickRepository = getRepository(Trick);
    const newTrick = trickRepository.create(req.body);
    const savedTrick = await trickRepository.save(newTrick);
    res.status(201).json(savedTrick);
  } catch (error) {
    res.status(500).json({ message: "Error creating trick", error });
  }
};

// Get all Tricks
export const getAllTricks = async (req: Request, res: Response) => {
  try {
    const trickRepository = getRepository(Trick);

    // รับพารามิเตอร์ page, limit และ search จาก query string
    const page = req.query.page
      ? parseInt(req.query.page as string, 10)
      : undefined;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : undefined;
    const search = req.query.search ? (req.query.search as string) : "";

    // สร้าง QueryBuilder
    const queryBuilder = trickRepository.createQueryBuilder("trick");

    // ถ้ามีการค้นหา ให้เพิ่มเงื่อนไขการค้นหา
    if (search) {
      queryBuilder.where(
        "trick.trick_name LIKE :search OR trick.trick_content LIKE :search",
        { search: `%${search}%` }
      );
    }

    // จัดการ pagination
    if (page && limit) {
      const offset = (page - 1) * limit;
      queryBuilder.skip(offset).take(limit);
    }

    // นับจำนวนทั้งหมด
    const [tricks, total] = await queryBuilder.getManyAndCount();

    if (tricks.length === 0) {
      return res.status(200).json({ message: "No tricks found" });
    }

    res.status(200).json({
      data: tricks,
      totalItems: total,
      totalPages: page && limit ? Math.ceil(total / limit) : 1,
      currentPage: page || 1,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching tricks", error });
  }
};




// Get a Trick by ID
export const getTrickById = async (req: Request, res: Response) => {
  try {
    const trickRepository = getRepository(Trick);
    const trick = await trickRepository.findOne({
      where: { id: parseInt(req.params.id) },
    });
    if (!trick) {
      return res.status(404).json({ message: "Trick not found" });
    }
    res.status(200).json(trick);
  } catch (error) {
    res.status(500).json({ message: "Error fetching trick", error });
  }
};

// Update a Trick by ID
export const updateTrick = async (req: Request, res: Response) => {
  try {
    const trickRepository = getRepository(Trick);
    const trick = await trickRepository.findOne({
      where: { id: parseInt(req.params.id) },
    });
    if (!trick) {
      return res.status(404).json({ message: "Trick not found" });
    }
    Object.assign(trick, req.body);
    const updatedTrick = await trickRepository.save(trick);
    res.status(200).json(updatedTrick);
  } catch (error) {
    res.status(500).json({ message: "Error updating trick", error });
  }
};

// Delete a Trick by ID
export const deleteTrick = async (req: Request, res: Response) => {
  try {
    const trickRepository = getRepository(Trick);
    const result = await trickRepository.delete(parseInt(req.params.id));
    if (result.affected === 0) {
      return res.status(404).json({ message: "Trick not found" });
    }
    res.status(204).json({ message: "Trick deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting trick", error });
  }
};
