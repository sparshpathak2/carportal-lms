import express from "express";
import { login, logout, signup, verifySession } from "../controllers/auth.Controller.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/verify-session", verifySession);

export default router;
