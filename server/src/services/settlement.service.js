import pool from "../config/db.js";

import {
    createSettlement,
} from "../repositories/settlement.repository.js";

import {
    findGroupMember,
} from "../repositories/group-member.repository.js";

import {
    findGroupExpenseBalances,
} from "../repositories/expense.repository.js";

import {
    findGroupSettlementBalances,
} from "../repositories/settlement.repository.js";

import { AppError } from "../utils/AppError.js";

export async function createNewSettlement({
    groupId,
    requesterId,
    paidBy,
    paidTo,
    amount,
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

    // 2. Sender and receiver cannot be the same
    if (paidBy === paidTo) {
        throw new AppError(
            400,
            "INVALID_SETTLEMENT_PARTIES",
            "The payer and receiver must be different users."
        );
    }

    // 3. Check payer membership
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

    // 4. Check receiver membership
    const receiver = await findGroupMember({
        groupId,
        userId: paidTo,
    });

    if (!receiver) {
        throw new AppError(
            400,
            "INVALID_RECEIVER",
            "The receiver must be a member of the group."
        );
    }

    // 5. Convert amount to paise
    const settlementAmountPaise =
        Math.round(amount * 100);

    if (settlementAmountPaise <= 0) {
        throw new AppError(
            400,
            "INVALID_SETTLEMENT_AMOUNT",
            "Settlement amount must be greater than zero."
        );
    }

    // 6. Get expense balances
    const expenseBalances =
        await findGroupExpenseBalances(groupId);

    // 7. Get settlement balances
    const settlementBalances =
        await findGroupSettlementBalances(groupId);

    // 8. Calculate current net balance
    const balances = expenseBalances.map(
        (expenseBalance) => {
            const settlementBalance =
                settlementBalances.find(
                    (item) =>
                        item.user_id ===
                        expenseBalance.user_id
                );

            const totalPaidPaise =
                Number(
                    expenseBalance.total_paid_paise
                );

            const totalOwedPaise =
                Number(
                    expenseBalance.total_owed_paise
                );

            const totalSettlementPaidPaise =
                Number(
                    settlementBalance
                        ?.total_settlement_paid_paise ?? 0
                );

            const totalSettlementReceivedPaise =
                Number(
                    settlementBalance
                        ?.total_settlement_received_paise ?? 0
                );

            const expenseNetBalancePaise =
                totalPaidPaise -
                totalOwedPaise;

            const netBalancePaise =
                expenseNetBalancePaise
                - totalSettlementReceivedPaise
                + totalSettlementPaidPaise;

            return {
                userId: expenseBalance.user_id,
                netBalancePaise,
            };
        }
    );

    const payerBalance = balances.find(
        (balance) =>
            balance.userId === paidBy
    );

    const receiverBalance = balances.find(
        (balance) =>
            balance.userId === paidTo
    );

    if (!payerBalance || !receiverBalance) {
        throw new AppError(
            400,
            "INVALID_SETTLEMENT_PARTIES",
            "Settlement users must belong to the group."
        );
    }

    // 9. Payer must currently owe money
    if (payerBalance.netBalancePaise >= 0) {
        throw new AppError(
            400,
            "NO_OUTSTANDING_DEBT",
            "The payer does not owe money to this group."
        );
    }

    // 10. Receiver must currently be owed money
    if (receiverBalance.netBalancePaise <= 0) {
        throw new AppError(
            400,
            "INVALID_SETTLEMENT_RECEIVER",
            "The receiver is not owed money."
        );
    }

    const outstandingDebtPaise =
        Math.min(
            Math.abs(
                payerBalance.netBalancePaise
            ),
            receiverBalance.netBalancePaise
        );

    // 11. Cannot settle more than outstanding debt
    if (
        settlementAmountPaise >
        outstandingDebtPaise
    ) {
        throw new AppError(
            400,
            "SETTLEMENT_EXCEEDS_DEBT",
            "Settlement amount exceeds the outstanding debt."
        );
    }

    // 12. Create settlement transactionally
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const settlement =
            await createSettlement(client, {
                groupId,
                paidBy,
                paidTo,
                amount,
            });

        await client.query("COMMIT");

        return settlement;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}