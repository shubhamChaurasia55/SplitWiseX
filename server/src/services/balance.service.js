import { findGroupMember } from "../repositories/group-member.repository.js";
import { findGroupExpenseBalances } from "../repositories/expense.repository.js";
import { AppError } from "../utils/AppError.js";

import { simplifyDebts } from "../utils/debt-simplification.js";
import { validateBalanceInvariant } from "../utils/balance-invariant.js";

import {
    findGroupSettlementBalances,
} from "../repositories/settlement.repository.js";

export async function getGroupBalances({
    groupId,
    requesterId,
}) {
    const requester =
        await findGroupMember({
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

    const expenseBalances = await findGroupExpenseBalances(groupId);

    const settlementBalances = await findGroupSettlementBalances(groupId);

    const normalizedBalances =
        expenseBalances.map((user) => {
            const settlement =
                settlementBalances.find(
                    (item) =>
                        item.user_id === user.user_id
                );

            const totalPaidPaise =
                Number(user.total_paid_paise);

            const totalOwedPaise =
                Number(user.total_owed_paise);

            const settlementPaidPaise =
                Number(
                    settlement
                        ?.total_settlement_paid_paise ?? 0
                );

            const settlementReceivedPaise =
                Number(
                    settlement
                        ?.total_settlement_received_paise ?? 0
                );

            const expenseNetBalancePaise =
                totalPaidPaise -
                totalOwedPaise;

            const netBalancePaise =
                expenseNetBalancePaise
                - settlementReceivedPaise
                + settlementPaidPaise;

            return {
                userId: user.user_id,
                name: user.name,
                email: user.email,

                totalPaidPaise,
                totalOwedPaise,

                settlementPaidPaise,
                settlementReceivedPaise,

                expenseNetBalancePaise,
                netBalancePaise,

                totalPaid:
                    totalPaidPaise / 100,

                totalOwed:
                    totalOwedPaise / 100,

                settlementPaid:
                    settlementPaidPaise / 100,

                settlementReceived:
                    settlementReceivedPaise / 100,

                netBalance:
                    netBalancePaise / 100,
            };
        });

    validateBalanceInvariant(
        normalizedBalances
    );

    return normalizedBalances;
}

export async function getSimplifiedDebts({
    groupId,
    requesterId,
}) {
    const requester =
        await findGroupMember({
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

    const expenseBalances =
        await findGroupExpenseBalances(groupId);

    const settlementBalances =
        await findGroupSettlementBalances(groupId);

    const normalizedBalances =
        expenseBalances.map((user) => {
            const settlement =
                settlementBalances.find(
                    (item) =>
                        item.user_id === user.user_id
                );

            const totalPaidPaise = Number(user.total_paid_paise);

            const totalOwedPaise = Number(user.total_owed_paise);

            const settlementPaidPaise =Number(
                    settlement?.total_settlement_paid_paise ?? 0
                );

            const settlementReceivedPaise =
                Number(
                    settlement
                        ?.total_settlement_received_paise ?? 0
                );

            const netBalancePaise =
                totalPaidPaise
                - totalOwedPaise
                - settlementReceivedPaise
                + settlementPaidPaise;

            return {
                userId: user.user_id,
                name: user.name,

                totalPaidPaise,
                totalOwedPaise,

                settlementPaidPaise,
                settlementReceivedPaise,

                netBalancePaise,
            };
        });

    validateBalanceInvariant(
        normalizedBalances
    );

    return simplifyDebts(
        normalizedBalances
    );
}
