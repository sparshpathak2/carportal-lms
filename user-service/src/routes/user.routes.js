import express from "express";
import {
    getAllUsers,
    getUserById,
    updateUserById,
    deleteUserById,
    getUsersByDealerId,
    addDealerOwner,
    removeDealerOwner,
    createUser
} from "../controllers/user.controller.js";

const router = express.Router();

// Create new user
router.post("/", createUser);

// Users CRUD
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUserById);
router.delete("/:id", deleteUserById);

// Users by dealer
router.get("/dealer/:id", getUsersByDealerId);

// Assign a dealer to a user (one-by-one)
// router.post("/:id/add-dealer", addDealerOwner);

// Remove dealer from user
// router.post("/:id/remove-dealer", removeDealerOwner);

export default router;
