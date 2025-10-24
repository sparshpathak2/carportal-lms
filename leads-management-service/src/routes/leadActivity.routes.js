import { Router } from "express";
import { getActivitiesByLeadId } from "../controllers/leadActivity.controller.js";

const router = Router();

// Lead Activity
router.get("/lead/:id", getActivitiesByLeadId)

export default router;
