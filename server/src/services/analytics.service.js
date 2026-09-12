import {
    findGroupExpenseSummary,
    findGroupMemberSpending,
} from "../repositories/analytics.repository.js";

import { findGroupMember } from "../repositories/group-member.repository.js";

import { AppError } from "../utils/AppError.js";


export async function getGroupAnalytics({
    groupId,
    requesterId,
}) {
    // Check group access
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

    const summary =
        await findGroupExpenseSummary(
            groupId
        );

    const memberSpending =
        await findGroupMemberSpending(
            groupId
        );

    return {
        summary: {
            totalExpenses:
                Number(
                    summary.total_expenses
                ),

            totalAmount:
                Number(
                    summary.total_amount_paise
                ) / 100,

            averageExpense:
                Number(
                    summary.average_amount_paise
                ) / 100,

            highestExpense:
                Number(
                    summary.highest_amount_paise
                ) / 100,

            lowestExpense:
                Number(
                    summary.lowest_amount_paise
                ) / 100,
        },

        memberSpending:
            memberSpending.map((member) => ({
                userId: member.user_id,
                name: member.name,

                totalPaid:
                    Number(
                        member.total_paid_paise
                    ) / 100,
            })),
    };
}