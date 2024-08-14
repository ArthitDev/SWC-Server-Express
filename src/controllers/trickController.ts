import { Request, Response } from "express";
import { getRepository } from "typeorm";
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
export const getAllTricks = async (_: Request, res: Response) => {
  try {
    const trickRepository = getRepository(Trick);
    const tricks = await trickRepository.find();

    if (tricks.length === 0) {
      return res.status(200).json({ message: "No tricks found" });
    }

    res.status(200).json(tricks);
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
