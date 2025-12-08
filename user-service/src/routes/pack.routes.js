import express from "express";
import {
    createPack,
    getAllPacks,
    getPackById,
    getPackByDealerId,
    updatePack,
    removePack
} from "../controllers/pack.controller.js";

const router = express.Router();

// All packs
router.get("/", getAllPacks);

// Create new pack
router.post("/", createPack);

// Get pack by ID
router.get("/:id", getPackById);

// Get packs for a dealer
router.get("/dealer/:dealerId", getPackByDealerId);

// Update pack
router.put("/:id", updatePack);

// Delete pack
router.delete("/:id", removePack);

export default router;
