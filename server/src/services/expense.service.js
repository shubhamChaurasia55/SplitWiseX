import pool from "../config/db.js";

import {
    createExpense,
    createExpenseSplit,
    findExpensesByGroupId,
    findExpenseById,
    findExpenseSplits,
    findExpenseByIdForUpdate,
    deleteExpenseSplits,
    updateExpense,
    deleteExpense,
} from "../repositories/expense.repository.js";

import {
    findGroupMember,
} from "../repositories/group-member.repository.js";

import { AppError } from "../utils/AppError.js";

import { calculateEqualSplit, validateExactSplit, calculatePercentageSplit } from "../utils/expense-split.js";

import {
    createNewNotification,
} from "./notification.service.js";

export async function createNewExpense({
    groupId,
    requesterId,
    description,
    amount,
    paidBy,
    splitType,
    participants,
    splits,
}) {
    // 1. Requester must belong to group
    const requester = await findGroupMember({
        groupId,
        userId: requesterId,
    });

    if (!requester) {
        throw new AppError(
            403,
            "GROUP_ACCESS_DENIED",
            "You are not a member of this group."
        );
    }

    // 2. Prepare final split
    let finalSplits;

    if(splitType == "EQUAL"){
        // participants must exist
        if(!participants || participants.length === 0){
            throw new AppError(
                400,
                "INVALID_PARTICIPANTS",
                "At least one participant is required."
            );
        }

        // prevent duplicate participants
        if(new Set(participants).size !== participants.length){
            throw new AppError(
                400,
                "DUPLICATE_PARTICIPANTS",
                "A participant can only appear once."
            );
        }

        // calculate equal share
        const splitAmounts = calculateEqualSplit(amount, participants.length);

        finalSplits = splitAmounts.map(
            (splitAmount, index) => ({
                userId: participants[index],
                amount: splitAmount,
            })
        );
    }
    else if(splitType == "EXACT"){
        // splits must exists
        if (!splits || splits.length === 0) {
            throw new AppError(
                400,
                "INVALID_SPLITS",
                "At least one split is required."
            );
        }

        // Prevent duplicate users
        if (
            new Set(
                splits.map(split => split.userId)
            ).size !== splits.length
        ) {
            throw new AppError(
                400,
                "DUPLICATE_PARTICIPANTS",
                "A participant can only appear once."
            );
        }

        // Check whether split amounts
        // exactly equal expense amount
        if (!validateExactSplit(amount, splits)) {
            throw new AppError(
                400,
                "EXPENSE_SPLIT_MISMATCH",
                "Split amounts must equal the expense amount."
            );
        }


        // EXACT splits are already calculated
        finalSplits = splits;

    }
    else if (splitType === "PERCENTAGE") {

        if (!splits || splits.length === 0) {
            throw new AppError(
                400,
                "INVALID_SPLITS",
                "At least one split is required."
            );
        }


        // Prevent duplicate users
        if (
            new Set(
                splits.map(split => split.userId)
            ).size !== splits.length
        ) {
            throw new AppError(
                400,
                "DUPLICATE_PARTICIPANTS",
                "A participant can only appear once."
            );
        }


        // Calculate total percentage
        const percentageTotal = splits.reduce(
            (total, split) => {
                return total + split.percentage;
            },
            0
        );


        // Must equal exactly 100%
        if (percentageTotal !== 100) {
            throw new AppError(
                400,
                "PERCENTAGE_MISMATCH",
                "Split percentages must equal 100%."
            );
        }


        // Calculate actual monetary amounts
        finalSplits = calculatePercentageSplit(
            amount,
            splits
        );
    }
    else {
        throw new AppError(
            400,
            "UNSUPPORTED_SPLIT_TYPE",
            "Unsupported split type."
        );
    }


    // 3. Payer must be a group member
    const payer = await findGroupMember({
        groupId,
        userId: paidBy,
    });

    if (!payer) {
        throw new AppError(
            400,
            "INVALID_PAYER",
            "The payer must be a member of the group."
        );
    }

    // 4. Every participant must belong to group
    for (const split of finalSplits) {

        const member = await findGroupMember({
            groupId,
            userId: split.userId,
        });

        if (!member) {
            throw new AppError(
                400,
                "INVALID_PARTICIPANT",
                "Every participant must be a member of the group."
            );
        }
    }

    // 5. Start database transaction

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        // 6. Create expense
        const expense = await createExpense(client, {
            groupId,
            description,
            amount,
            paidBy,
            splitType,
            createdBy: requesterId
        });


        // 7. Create expense splits
        const createdSplits = [];

        for (const split of finalSplits) {

            const createdSplit =
                await createExpenseSplit(client, {
                    expenseId: expense.id,
                    userId: split.userId,
                    amount: split.amount,
                    percentage: split.percentage ?? null,
                });


            createdSplits.push(createdSplit);
        }

        // 8. Commit transaction
        await client.query("COMMIT");

        // Notification
        for (const split of finalSplits) {
            if (split.userId === requesterId) {
                continue;
            }

            await createNewNotification({
                userId: split.userId,
                type: "EXPENSE_ADDED",
                title: "New expense added",
                message: `${description} of ₹${amount} was added to your group.`,
            });
        }

        // 9. Return result
        return {
            expense,
            splits: createdSplits,
        };


    } catch (error) {

        // If anything fails,
        // undo expense + splits
        await client.query("ROLLBACK");

        throw error;


    } finally {

        // Always release DB connection
        client.release();
    }
}

export async function getGroupExpenses({
    groupId,
    requesterId,
}) {
    // Check requester membership
    const requester = await findGroupMember({
        groupId,
        userId: requesterId,
    });

    if (!requester) {
        throw new AppError(
            403,
            "GROUP_ACCESS_DENIED",
            "You are not a member of this group."
        );
    }

    return await findExpensesByGroupId(groupId);
}


export async function getExpenseDetails({
    groupId,
    expenseId,
    requesterId,
}) {

    // 1. Check requester membership
    const requester = await findGroupMember({
        groupId,
        userId: requesterId,
    });

    if (!requester) {
        throw new AppError(
            403,
            "GROUP_ACCESS_DENIED",
            "You are not a member of this group."
        );
    }


    // 2. Find expense
    const expense = await findExpenseById(
        expenseId,
        groupId
    );

    if (!expense) {
        throw new AppError(
            404,
            "EXPENSE_NOT_FOUND",
            "Expense not found."
        );
    }

    // 3. Get splits
    const splits = await findExpenseSplits(
        expenseId
    );


    return {
        expense,
        splits,
    };
}

export async function updateExistingExpense({
    groupId,
    expenseId,
    requesterId,
    description,
    amount,
    paidBy,
    splitType,
    participants,
    splits,
}) {

    // 1. Check requester membership
    const requester = await findGroupMember({
        groupId,
        userId: requesterId,
    });

    if (!requester) {
        throw new AppError(
            403,
            "GROUP_ACCESS_DENIED",
            "You are not a member of this group."
        );
    }

    // 2. Start transaction
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // 3. Find and lock expense
        const existingExpense =await findExpenseByIdForUpdate(client,
                expenseId,
                groupId
            );


        if (!existingExpense) {
            throw new AppError(
                404,
                "EXPENSE_NOT_FOUND",
                "Expense not found."
            );
        }

        // 4. Only creator can edit
        if (
            existingExpense.created_by !==
            requesterId
        ) {
            throw new AppError(
                403,
                "EXPENSE_EDIT_FORBIDDEN",
                "Only the expense creator can edit this expense."
            );
        }

        // 5. Validate payer
        const payer = await findGroupMember({
            groupId,
            userId: paidBy,
        });

        if (!payer) {
            throw new AppError(
                400,
                "INVALID_PAYER",
                "The payer must be a member of the group."
            );
        }

        // 6. Calculate new splits
        let finalSplits;

        // EQUAL
        if (splitType === "EQUAL") {

            if (
                !participants ||
                participants.length === 0
            ) {
                throw new AppError(
                    400,
                    "INVALID_PARTICIPANTS",
                    "At least one participant is required."
                );
            }


            if (
                new Set(participants).size !==
                participants.length
            ) {
                throw new AppError(
                    400,
                    "DUPLICATE_PARTICIPANTS",
                    "A participant can only appear once."
                );
            }


            const splitAmounts =
                calculateEqualSplit(
                    amount,
                    participants.length
                );


            finalSplits =
                splitAmounts.map(
                    (splitAmount, index) => ({
                        userId:
                            participants[index],
                        amount: splitAmount,
                    })
                );
        }
        // EXACT
        else if (splitType === "EXACT") {

            if (
                !splits ||
                splits.length === 0
            ) {
                throw new AppError(
                    400,
                    "INVALID_SPLITS",
                    "At least one split is required."
                );
            }


            if (
                new Set(
                    splits.map(
                        split => split.userId
                    )
                ).size !== splits.length
            ) {
                throw new AppError(
                    400,
                    "DUPLICATE_PARTICIPANTS",
                    "A participant can only appear once."
                );
            }


            if (
                !validateExactSplit(
                    amount,
                    splits
                )
            ) {
                throw new AppError(
                    400,
                    "EXPENSE_SPLIT_MISMATCH",
                    "Split amounts must equal the expense amount."
                );
            }


            finalSplits = splits;
        }

        // PERCENTAGE
        else if (
            splitType === "PERCENTAGE"
        ) {

            if (
                !splits ||
                splits.length === 0
            ) {
                throw new AppError(
                    400,
                    "INVALID_SPLITS",
                    "At least one split is required."
                );
            }


            if (
                new Set(
                    splits.map(
                        split => split.userId
                    )
                ).size !== splits.length
            ) {
                throw new AppError(
                    400,
                    "DUPLICATE_PARTICIPANTS",
                    "A participant can only appear once."
                );
            }

            const percentageTotal =
                splits.reduce(
                    (total, split) => {
                        return (
                            total +
                            split.percentage
                        );
                    },
                    0
                );


            if (
                percentageTotal !== 100
            ) {
                throw new AppError(
                    400,
                    "PERCENTAGE_MISMATCH",
                    "Split percentages must equal 100%."
                );
            }


            finalSplits =
                calculatePercentageSplit(
                    amount,
                    splits
                );
        }
        else {

            throw new AppError(
                400,
                "UNSUPPORTED_SPLIT_TYPE",
                "Unsupported split type."
            );
        }

        // 7. Validate participants
        for (
            const split of finalSplits
        ) {

            const member =
                await findGroupMember({
                    groupId,
                    userId: split.userId,
                });


            if (!member) {
                throw new AppError(
                    400,
                    "INVALID_PARTICIPANT",
                    "Every participant must be a member of the group."
                );
            }
        }

        // 8. Update expense
        const updatedExpense =
            await updateExpense(
                client,
                {
                    expenseId,
                    groupId,
                    description,
                    amount,
                    paidBy,
                    splitType,
                }
            );

        // 9. Delete old splits
        await deleteExpenseSplits(
            client,
            expenseId
        );

        // 10. Create new splits
        const createdSplits = [];
        for (
            const split of finalSplits
        ) {

            const createdSplit =
                await createExpenseSplit(
                    client,
                    {
                        expenseId,
                        userId: split.userId,
                        amount: split.amount,
                        percentage:
                            split.percentage ??
                            null,
                    }
                );


            createdSplits.push(
                createdSplit
            );
        }

        // 11. Commit
        await client.query("COMMIT");

        return {
            expense: updatedExpense,
            splits: createdSplits,
        };


    } catch (error) {
        // Rollback if anything fails
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}


export async function deleteExistingExpense({
    groupId,
    expenseId,
    requesterId,
}) {

    // 1. Check requester membership
    const requester = await findGroupMember({
        groupId,
        userId: requesterId,
    });

    if (!requester) {
        throw new AppError(
            403,
            "GROUP_ACCESS_DENIED",
            "You are not a member of this group."
        );
    }

    // 2. Get DB connection
    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        // 3. Find and lock expens
        const expense =
            await findExpenseByIdForUpdate(
                client,
                expenseId,
                groupId
            );


        if (!expense) {
            throw new AppError(
                404,
                "EXPENSE_NOT_FOUND",
                "Expense not found."
            );
        }

        // 4. Only creator can delete
        if (
            expense.created_by !==
            requesterId
        ) {
            throw new AppError(
                403,
                "EXPENSE_DELETE_FORBIDDEN",
                "Only the expense creator can delete this expense."
            );
        }

        // 5. Delete expense
        const deletedExpense =
            await deleteExpense(
                client,
                {
                    expenseId,
                    groupId,
                }
            );

        // 6. Commit
        await client.query("COMMIT");

        return deletedExpense;
    } 
    catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } 
    finally {
        client.release();
    }
}