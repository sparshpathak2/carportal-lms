import express from "express";
import { getAllUsers, getUserById, updateUserById, deleteUserById, getUsersByDealerId } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put('/:id', updateUserById);
router.delete('/:id', deleteUserById);
router.get('/dealer/:id', getUsersByDealerId);

export default router;
