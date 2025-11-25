import { Router } from "express";
import {
    createRole,
    getRoles,
    getRoleById,
    updateRole,
    deleteRole
} from "../controllers/role.controller.js";

const router = Router();

// Roles
router.get("/", getRoles);             // Get all roles
router.get("/:id", getRoleById);        // Get single role
router.post("/", createRole);           // Create role
router.put("/:id", updateRole);         // Update role
router.delete("/:id", deleteRole);      // Delete role

export default router;
