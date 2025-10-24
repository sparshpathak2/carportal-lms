import { Router } from "express";
import { createComment, getCommentsByLeadId } from "../controllers/leadComment.controller.js";

const router = Router();

// Lead Comments
router.get("/lead/:id", getCommentsByLeadId)
router.post("/", createComment)

export default router;
