import { findGroupMember } from "../repositories/group-member.repository.js";
import { findGroupExpenseBalances } from "../repositories/expense.repository.js";
import { AppError } from "../utils/AppError.js";

import { simplifyDebts } from "../utils/debt-simplification.js";
import { validateBalanceInvariant } from "../utils/balance-invariant.js";

export async function getGroupBalances({ groupId, requesterId }) {
  // 1. Make sure the requester is a member of this group
  const requester = await findGroupMember({ groupId, userId: requesterId });

  if (!requester) {
    throw new AppError(
      403,
      "GROUP_ACCESS_DENIED",
      "You are not a member of this group.",
    );
  }

  // 2. Get each member's total paid / owed, in paise (integer)
  const balances = await findGroupExpenseBalances(groupId);

  // 3. Compute net balance in paise, then expose rupee values for API readability
  const normalizedBalances = balances.map((user) => {
    const totalPaidPaise = Number(user.total_paid_paise);

    const totalOwedPaise = Number(user.total_owed_paise);

    const netBalancePaise = totalPaidPaise - totalOwedPaise;

    return {
      userId: user.user_id,
      name: user.name,
      email: user.email,

      totalPaidPaise,
      totalOwedPaise,
      netBalancePaise,

      totalPaid: totalPaidPaise / 100,

      totalOwed: totalOwedPaise / 100,

      netBalance: netBalancePaise / 100,
    };
  });

  validateBalanceInvariant(normalizedBalances);

  return normalizedBalances;
}

export async function getSimplifiedDebts({ groupId, requesterId }) {
  // 1. Make sure the requester is a member of this group
  const requester = await findGroupMember({ groupId, userId: requesterId });

  if (!requester) {
    throw new AppError(
      403,
      "GROUP_ACCESS_DENIED",
      "You are not a member of this group.",
    );
  }

  // 2. Get each member's total paid / owed, in paise
  const balances = await findGroupExpenseBalances(groupId);

  // 3. Convert DB values and compute net balance in paise
  const normalizedBalances = balances.map((user) => {
    const totalPaidPaise = Number(user.total_paid_paise);
    const totalOwedPaise = Number(user.total_owed_paise);

    return {
      userId: user.user_id,
      name: user.name,
      totalPaidPaise,
      totalOwedPaise,
      netBalancePaise: totalPaidPaise - totalOwedPaise,
    };
  });

  validateBalanceInvariant(normalizedBalances);

  // 4. Reduce to the minimal set of settle-up transactions
  return simplifyDebts(normalizedBalances);
}
