import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import apiClient from "../api/client";
import useAuthStore from "../stores/auth.store";
import useGroupStore from "../stores/group.store";

function Dashboard() {
    const user = useAuthStore((state) => state.user);

    const groups = useGroupStore((state) => state.groups);
    const isLoadingGroups = useGroupStore(
        (state) => state.isLoading
    );
    const loadGroups = useGroupStore(
        (state) => state.loadGroups
    );
    const getBalances = useGroupStore(
        (state) => state.getBalances
    );

    const [youOwe, setYouOwe] = useState(0);
    const [youGet, setYouGet] = useState(0);

    const [groupData, setGroupData] = useState([]);

    const [expenses, setExpenses] = useState([]);

    const [balanceLoading, setBalanceLoading] =
        useState(true);

    const [expenseLoading, setExpenseLoading] =
        useState(true);

    /*
     * Load groups
     */
    useEffect(() => {
        loadGroups();
    }, [loadGroups]);

    /*
     * Load balances for all groups
     */
    useEffect(() => {
        async function loadDashboardBalances() {
            if (!groups.length) {
                setYouOwe(0);
                setYouGet(0);
                setGroupData([]);
                setBalanceLoading(false);
                return;
            }

            setBalanceLoading(true);

            try {
                const results = await Promise.all(
                    groups.map(async (group) => {
                        const balances =
                            await getBalances(group.id);

                        const currentUserBalance =
                            balances.find(
                                (balance) =>
                                    balance.userId ===
                                    user?.id
                            );

                        const totalSpent =
                            balances.reduce(
                                (total, balance) =>
                                    total +
                                    Number(
                                        balance.totalPaid || 0
                                    ),
                                0
                            );

                        return {
                            id: group.id,
                            name: group.name,
                            members: balances.length,
                            totalSpent,
                            netBalance:
                                Number(
                                    currentUserBalance?.netBalance ||
                                        0
                                ),
                        };
                    })
                );

                let owe = 0;
                let get = 0;

                results.forEach((group) => {
                    if (group.netBalance < 0) {
                        owe += Math.abs(
                            group.netBalance
                        );
                    }

                    if (group.netBalance > 0) {
                        get += group.netBalance;
                    }
                });

                setYouOwe(owe);
                setYouGet(get);
                setGroupData(results);
            } catch (error) {
                console.error(
                    "Failed to load dashboard balances:",
                    error
                );
            } finally {
                setBalanceLoading(false);
            }
        }

        loadDashboardBalances();
    }, [groups, getBalances, user?.id]);

    /*
     * Load recent expenses
     */
    useEffect(() => {
        async function loadRecentExpenses() {
            if (!groups.length) {
                setExpenses([]);
                setExpenseLoading(false);
                return;
            }

            setExpenseLoading(true);

            try {
                const results = await Promise.all(
                    groups.map(async (group) => {
                        const response =
                            await apiClient.get(
                                `/groups/${group.id}/expenses`
                            );

                        const groupExpenses =
                            response.data.data.expenses ||
                            [];

                        return groupExpenses.map(
                            (expense) => ({
                                ...expense,
                                groupName: group.name,
                            })
                        );
                    })
                );

                const allExpenses =
                    results.flat();

                allExpenses.sort(
                    (a, b) =>
                        new Date(b.created_at) -
                        new Date(a.created_at)
                );

                setExpenses(
                    allExpenses.slice(0, 5)
                );
            } catch (error) {
                console.error(
                    "Failed to load expenses:",
                    error
                );
            } finally {
                setExpenseLoading(false);
            }
        }

        loadRecentExpenses();
    }, [groups]);

    const netBalance = youGet - youOwe;

    return (
        <div className="mx-auto max-w-7xl">

            {/* Header */}

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Good morning, {user?.name}
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Here's your expense overview.
                    </p>
                </div>

                <Link
                    to="/groups"
                    className="w-fit rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
                >
                    + Create group
                </Link>

            </div>

            {/* Summary */}

            <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">

                <SummaryCard
                    title="You owe"
                    value={youOwe}
                    loading={balanceLoading}
                />

                <SummaryCard
                    title="You get"
                    value={youGet}
                    loading={balanceLoading}
                />

                <SummaryCard
                    title="Net balance"
                    value={netBalance}
                    loading={balanceLoading}
                    showSign
                />

                <SummaryCard
                    title="Groups"
                    value={groups.length}
                    loading={isLoadingGroups}
                    currency={false}
                />

            </div>

            {/* Financial overview */}

            <div className="mt-5 rounded-xl border border-gray-200 bg-white px-5 py-4">

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                        <p className="text-sm font-medium text-gray-900">
                            Financial overview
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                            Your current position across all groups.
                        </p>
                    </div>

                    {balanceLoading ? (
                        <div className="h-5 w-32 animate-pulse rounded bg-gray-100" />
                    ) : (
                        <p className="text-sm text-gray-700">
                            {netBalance > 0
                                ? `You are owed ₹${netBalance.toFixed(2)} overall`
                                : netBalance < 0
                                ? `You owe ₹${Math.abs(
                                      netBalance
                                  ).toFixed(2)} overall`
                                : "You are all settled up"}
                        </p>
                    )}

                </div>

            </div>

            {/* Recent expenses */}

           

            {/* Groups */}

            <section className="mt-7">

                <div className="mb-3 flex items-center justify-between">

                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Your groups
                        </h2>

                        <p className="mt-1 text-xs text-gray-500">
                            A quick view of your groups and balances.
                        </p>
                    </div>

                    <Link
                        to="/groups"
                        className="text-sm text-gray-500 hover:text-gray-900 hover:underline"
                    >
                        View all
                    </Link>

                </div>

                {isLoadingGroups ? (
                    <div className="rounded-xl border border-gray-200 bg-white p-6">
                        <p className="text-sm text-gray-500">
                            Loading groups...
                        </p>
                    </div>
                ) : groupData.length === 0 ? (
                    <div className="rounded-xl border border-gray-200 bg-white p-6">
                        <p className="text-sm text-gray-500">
                            No groups yet.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">

                        {groupData.slice(0, 5).map((group) => (
                            <Link
                                key={group.id}
                                to={`/groups/${group.id}`}
                                className="grid grid-cols-[1fr_auto] gap-4 border-b border-gray-100 px-5 py-4 last:border-b-0 hover:bg-gray-50 sm:grid-cols-[1.5fr_1fr_1fr_auto] sm:items-center"
                            >

                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {group.name}
                                    </p>

                                    <p className="mt-1 text-xs text-gray-500">
                                        {group.members}{" "}
                                        {group.members === 1
                                            ? "member"
                                            : "members"}
                                    </p>
                                </div>

                                <div className="hidden sm:block">
                                    <p className="text-xs text-gray-400">
                                        Total spent
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-gray-900">
                                        ₹
                                        {group.totalSpent.toFixed(
                                            2
                                        )}
                                    </p>
                                </div>

                                <div className="text-right sm:text-left">

                                    <p className="text-xs text-gray-400">
                                        Your balance
                                    </p>

                                    <p
                                        className={`mt-1 text-sm font-medium ${
                                            group.netBalance > 0
                                                ? "text-green-600"
                                                : group.netBalance < 0
                                                ? "text-red-600"
                                                : "text-gray-500"
                                        }`}
                                    >
                                        {group.netBalance > 0
                                            ? `+₹${group.netBalance.toFixed(
                                                  2
                                              )}`
                                            : group.netBalance < 0
                                            ? `-₹${Math.abs(
                                                  group.netBalance
                                              ).toFixed(2)}`
                                            : "Settled"}
                                    </p>

                                </div>

                                <span className="hidden text-gray-400 sm:block">
                                    →
                                </span>

                            </Link>
                        ))}

                    </div>
                )}

            </section>

        </div>
    );
}

function SummaryCard({
    title,
    value,
    loading,
    currency = true,
    showSign = false,
}) {
    let displayValue;

    if (!currency) {
        displayValue = value;
    } else if (showSign && value > 0) {
        displayValue = `+₹${Number(value).toFixed(2)}`;
    } else if (showSign && value < 0) {
        displayValue = `-₹${Math.abs(
            Number(value)
        ).toFixed(2)}`;
    } else {
        displayValue = `₹${Number(value).toFixed(2)}`;
    }

    return (
        <div className="rounded-xl border border-gray-200 bg-white px-5 py-4">

            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                {title}
            </p>

            {loading ? (
                <div className="mt-3 h-7 w-24 animate-pulse rounded bg-gray-100" />
            ) : (
                <p className="mt-2 text-xl font-semibold text-gray-900">
                    {displayValue}
                </p>
            )}

        </div>
    );
}

export default Dashboard;