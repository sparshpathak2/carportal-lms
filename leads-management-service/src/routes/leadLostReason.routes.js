import { Router } from "express";
import {
    getLeadLostReasons,
    getLeadLostReasonById,
    createLeadLostReason,
    updateLeadLostReason,
    deleteLeadLostReason,
} from "../controllers/leadLostReason.controller.js";

const router = Router();

// Lead Lost Reasons
router.get("/", getLeadLostReasons);
router.get("/:id", getLeadLostReasonById);
router.post("/", createLeadLostReason);
router.put("/:id", updateLeadLostReason);
router.delete("/:id", deleteLeadLostReason);

export default router;
