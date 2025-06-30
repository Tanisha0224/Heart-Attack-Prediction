import express from "express";
import { predictHeartRisk } from "../controllers/predictController.js";

const router = express.Router();

router.post("/predict-heart-risk", predictHeartRisk);

export default router;
