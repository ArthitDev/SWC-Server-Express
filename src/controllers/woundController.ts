// src/controllers/woundController.ts
import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Wound } from "../entities/Wound";
import path from "path";
import fs from "fs";

// Function to create a wound entry with image upload
export const createWound = async (req: Request, res: Response) => {
  const woundRepository = getRepository(Wound);

  try {
    const { wound_name, wound_content, ref } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Get the relative path for storing in the database
    const filePath = `wound_image/${req.file.filename}`;

    // Create a new wound entry and save to the database
    const newWound = woundRepository.create({
      wound_name,
      wound_cover: filePath, // Save the relative path to the image
      wound_content,
      ref,
    } as Wound);

    await woundRepository.save(newWound);

    res.status(201).json(newWound);
  } catch (error) {
    console.error("Error creating wound:", error);
    res.status(500).json({ message: "Error creating wound", error });
  }
};

// Function to get all wound entries
export const getAllWounds = async (req: Request, res: Response) => {
  try {
    const woundRepository = getRepository(Wound);
    const wounds = await woundRepository.find();

    if (wounds.length === 0) {
      return res.status(200).json({ message: "No wounds found" });
    }

    res.status(200).json(wounds);
  } catch (error) {
    res.status(500).json({ message: "Error fetching wounds", error });
  }
};

// Function to get a specific wound entry by ID
export const getWoundById = async (req: Request, res: Response) => {
  try {
    const woundRepository = getRepository(Wound);
    const wound = await woundRepository.findOne({
      where: { id: parseInt(req.params.id, 10) },
    });

    if (!wound) {
      return res.status(404).json({ message: "Wound not found" });
    }

    res.status(200).json(wound);
  } catch (error) {
    res.status(500).json({ message: "Error fetching wound", error });
  }
};

// Function to update a wound entry
export const updateWound = async (req: Request, res: Response) => {
  try {
    const woundRepository = getRepository(Wound);
    const wound = await woundRepository.findOne({
      where: { id: parseInt(req.params.id, 10) },
    });

    if (!wound) {
      return res.status(404).json({ message: "Wound not found" });
    }

    const { wound_name, wound_content, ref } = req.body;
    wound.wound_name = wound_name ?? wound.wound_name;
    wound.wound_content = wound_content ?? wound.wound_content;
    wound.ref = ref ?? wound.ref;

    if (req.file) {
      // Delete the old file
      if (wound.wound_cover) {
        const oldFilePath = path.join(
          __dirname,
          "../../uploads",
          wound.wound_cover
        );
        fs.unlink(oldFilePath, (err) => {
          if (err) console.error("Error deleting old file:", err);
        });
      }

      // Update with the new file path
      const filePath = `wound_image/${req.file.filename}`;
      wound.wound_cover = filePath;
    }

    await woundRepository.save(wound);
    res.status(200).json(wound);
  } catch (error) {
    res.status(500).json({ message: "Error updating wound", error });
  }
};

// Function to delete a wound entry
export const deleteWound = async (req: Request, res: Response) => {
  try {
    const woundRepository = getRepository(Wound);
    const wound = await woundRepository.findOne({
      where: { id: parseInt(req.params.id, 10) },
    });

    if (!wound) {
      return res.status(404).json({ message: "Wound not found" });
    }

    // Delete the image file
    if (wound.wound_cover) {
      const filePath = path.join(__dirname, "../../uploads", wound.wound_cover);
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }

    await woundRepository.remove(wound);
    res.status(200).json({ message: "Wound deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting wound", error });
  }
};
