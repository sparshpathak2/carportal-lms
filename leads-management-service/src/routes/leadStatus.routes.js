import { Router } from "express";
import { deleteLeadStatus, getLeadStatusById, getLeadStatuses, updateLeadStatus, createLeadStatus } from "../controllers/leadStatus.controller.js";

const router = Router();

// Lead Statuses
router.get("/", getLeadStatuses)
router.get("/:id", getLeadStatusById)
router.post("/", createLeadStatus);
router.get("/:id", updateLeadStatus)
router.get("/:id", deleteLeadStatus)

export default router;
