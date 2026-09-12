import express from "express";

import {
    createSettlement,
    getSettlements,
} from "../controllers/settlement.controller.js";

import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
    "/:groupId/settlements",
    requireAuth,
    createSettlement
);

router.get(
    "/:groupId/settlements",
    requireAuth,
    getSettlements
);

export default router;