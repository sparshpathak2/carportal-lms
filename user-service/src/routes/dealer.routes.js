import express from "express";
import { createDealer, deleteDealerById, getAllDealers, getDealerById, updateDealerById } from "../controllers/dealer.controller.js";

const router = express.Router();

router.get("/", getAllDealers);
router.post("/", createDealer);
router.get("/:id", getDealerById);
router.put('/:id', updateDealerById);
router.delete('/:id', deleteDealerById);

export default router;
