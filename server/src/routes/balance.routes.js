import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { getBalances, getDebts } from "../controllers/balance.controller.js";

const router = express.Router();

router.get("/:groupId/balances", requireAuth, getBalances);

router.get("/:groupId/debts", requireAuth, getDebts);

export default router;