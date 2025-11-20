import express from "express";
import { saveUserFilter, getUserFilter } from "../controllers/filter.controller.js";

const router = express.Router();

router.post("/save", saveUserFilter);
router.get("/get", getUserFilter);

export default router;
