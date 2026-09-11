import { Router } from "express";

import { requireAuth } from "../middleware/auth.middleware.js";

import {
    createExpense,
    getExpenses,
    getExpense,
    updateExpense,
    deleteExpense,
} from "../controllers/expense.controller.js";

const router = Router();

router.post(
    "/:groupId/expenses",
    requireAuth,
    createExpense
);

router.get(
    "/:groupId/expenses",
    requireAuth,
    getExpenses
);


router.get(
    "/:groupId/expenses/:expenseId",
    requireAuth,
    getExpense
);

router.put(
    "/:groupId/expenses/:expenseId",
    requireAuth,
    updateExpense
);

router.delete(
    "/:groupId/expenses/:expenseId",
    requireAuth,
    deleteExpense
);

export default router;