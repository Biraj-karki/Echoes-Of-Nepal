import express from "express";
import { getPublicTourismData } from "../controllers/publicTourismController.js";

const router = express.Router();

router.get("/districts", getPublicTourismData);

export default router;
