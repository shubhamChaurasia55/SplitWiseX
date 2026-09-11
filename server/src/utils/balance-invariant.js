import { AppError } from "./AppError.js";

export function validateBalanceInvariant(balances) {
    const totalNetBalancePaise = balances.reduce(
        (total, balance) => {
            return total + balance.netBalancePaise;
        },
        0
    );

    if (totalNetBalancePaise !== 0) {
        throw new AppError(
            500,
            "BALANCE_INVARIANT_VIOLATION",
            "Group balances are inconsistent."
        );
    }

    return true;
}