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
export const getAllDidyouknow = async (_: Request, res: Response) => {
  try {
    const didyouknowRepository = getRepository(DidYouKnow);
    const didyouknow = await didyouknowRepository.find();

    if (didyouknow.length === 0) {
      return res.status(200).json({ message: "No Didyouknow found" });
    }

    res.status(200).json(DidYouKnow);
  } catch (error) {
    res.status(500).json({ message: "Error fetching didyouknow", error });
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
