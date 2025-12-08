import { Router } from "express";
import { getLeadSources } from "../controllers/leadSources.controller.js";

const router = Router();

// Lead Statuses
router.get("/", getLeadSources)
// router.get("/:id", getLeadSourceById)
// router.post("/", createLeadSource);
// router.put("/:id", updateLeadSource)
// router.delete("/:id", deleteLeadSource)

export default router;
