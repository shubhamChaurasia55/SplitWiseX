import {
    createNewExpense,
    getGroupExpenses,
    getExpenseDetails,
    updateExistingExpense,
    deleteExistingExpense,
} from "../services/expense.service.js";

import {
    createExpenseSchema,
    updateExpenseSchema,
} from "../validators/expense.validator.js";

export async function createExpense(
    req,
    res,
    next
) {
    try {

        const result =
            createExpenseSchema.safeParse(
                req.body
            );


        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid expense data.",
                    details: result.error.issues,
                },
            });
        }


        const expense =
            await createNewExpense({
                groupId: req.params.groupId,
                requesterId: req.user.id,

                ...result.data,
            });


        return res.status(201).json({
            success: true,
            data: expense,
        });

    } catch (error) {
        next(error);
    }
}

export async function getExpenses(
    req,
    res,
    next
) {
    try {

        const expenses = await getGroupExpenses({
            groupId: req.params.groupId,
            requesterId: req.user.id,
        });

        return res.status(200).json({
            success: true,
            data: {
                expenses,
            },
        });

    } catch (error) {
        next(error);
    }
}

export async function getExpense(
    req,
    res,
    next
) {
    try {

        const result = await getExpenseDetails({
            groupId: req.params.groupId,
            expenseId: req.params.expenseId,
            requesterId: req.user.id,
        });

        return res.status(200).json({
            success: true,
            data: result,
        });

    } catch (error) {
        next(error);
    }
}

export async function updateExpense(
    req,
    res,
    next
) {
    try {

        const result =
            updateExpenseSchema.safeParse(
                req.body
            );


        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid expense data.",
                    details: result.error.issues,
                },
            });
        }


        const updatedExpense =
            await updateExistingExpense({
                groupId: req.params.groupId,
                expenseId: req.params.expenseId,
                requesterId: req.user.id,

                ...result.data,
            });


        return res.status(200).json({
            success: true,
            data: updatedExpense,
        });

    } catch (error) {
        next(error);
    }
}


export async function deleteExpense(
    req,
    res,
    next
) {
    try {

        const expense =
            await deleteExistingExpense({
                groupId: req.params.groupId,
                expenseId: req.params.expenseId,
                requesterId: req.user.id,
            });


        return res.status(200).json({
            success: true,
            data: {
                expense,
            },
        });

    } catch (error) {
        next(error);
    }
}