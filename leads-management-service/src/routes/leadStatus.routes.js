import { Router } from "express";
import { deleteLeadStatus, getLeadStatusById, getLeadStatuses, updateLeadStatus } from "../controllers/leadStatus.controller.js";

const router = Router();

// Lead Statuses
router.get("/", getLeadStatuses)
router.get("/:id", getLeadStatusById)
router.get("/:id", updateLeadStatus)
router.get("/:id", deleteLeadStatus)

export default router;
