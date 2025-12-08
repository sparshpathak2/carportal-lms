import express from "express";
import {
    assignDealerOwner,
    removeDealerOwner,
    getDealerOwner
} from "../controllers/dealerOwner.controller.js";

const router = express.Router();

// GET -> fetch current owner
router.get("/:dealerId", getDealerOwner);

// POST -> assign new owner
router.post("/:dealerId/:userId", assignDealerOwner);

// DELETE -> remove owner
router.delete("/:dealerId", removeDealerOwner);

export default router;
