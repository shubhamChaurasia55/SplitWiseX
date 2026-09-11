import {
    createNewExpense,
    getGroupExpenses,
    getExpenseDetails,
} from "../services/expense.service.js";

export async function createExpense(
    req,
    res,
    next
) {
    try {

        const result = await createNewExpense({
            groupId: req.params.groupId,
            requesterId: req.user.id,

            description: req.body.description,
            amount: req.body.amount,
            paidBy: req.body.paidBy,
            splitType: req.body.splitType,
            participants: req.body.participants,
            splits: req.body.splits,
        });

        return res.status(201).json({
            success: true,
            data: result,
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