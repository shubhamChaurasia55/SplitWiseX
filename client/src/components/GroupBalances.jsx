import { useEffect, useState } from "react";

import { getGroupBalances, getGroupDebts } from "../api/groups.api";

function GroupBalances({ groupId, refreshKey }) {
  const [balances, setBalances] = useState([]);
  const [debts, setDebts] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBalances() {
      setIsLoading(true);
      setError("");

      try {
        const [balancesData, debtsData] = await Promise.all([
          getGroupBalances(groupId),
          getGroupDebts(groupId),
        ]);

        setBalances(balancesData.data.balances);
        setDebts(debtsData.data.debts);
      } catch (error) {
        setError(
          error.response?.data?.error?.message ||
            "Unable to load balances.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadBalances();
  }, [groupId, refreshKey]);

  if (isLoading) {
    return (
      <div className="flex min-h-48 items-center justify-center">
        <p className="text-sm text-gray-500">
          Loading balances...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* =========================================================
          SIMPLIFIED DEBTS - PRIMARY FEATURE
      ========================================================== */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Simplified settlement plan
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            We reduced the number of payments needed to settle the group.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">

          {/* Header */}
          <div className="border-b border-gray-200 bg-gray-50 px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="text-sm font-medium text-gray-500">
                  Payments to settle
                </p>

                <p className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                  {debts.length}
                </p>
              </div>

              <div className="max-w-md">
                <p className="text-sm leading-6 text-gray-600">
                  Instead of everyone paying everyone else,
                  SplitWiseX calculates a simpler set of transactions
                  between people who owe and people who should receive.
                </p>
              </div>

            </div>
          </div>

          {/* Settlement list */}
          {debts.length === 0 ? (
            <div className="px-5 py-12 text-center sm:px-6">
              <p className="text-sm font-medium text-gray-900">
                Everyone is settled up
              </p>

              <p className="mt-1 text-sm text-gray-500">
                There are no payments needed right now.
              </p>
            </div>
          ) : (
            <div>
              {debts.map((debt, index) => (
                <div
                  key={`${debt.from.userId}-${debt.to.userId}-${index}`}
                  className={`px-5 py-5 sm:px-6 ${
                    index !== debts.length - 1
                      ? "border-b border-gray-100"
                      : ""
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    {/* People */}
                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
                        {debt.from.name?.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {debt.from.name}
                        </p>

                        <p className="text-xs text-gray-500">
                          needs to pay
                        </p>
                      </div>

                      <span className="text-lg text-gray-400">
                        →
                      </span>

                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {debt.to.name}
                        </p>

                        <p className="text-xs text-gray-500">
                          should receive
                        </p>
                      </div>

                    </div>

                    {/* Amount */}
                    <div className="sm:text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        ₹{Number(debt.amount).toFixed(2)}
                      </p>

                      <p className="text-xs text-gray-500">
                        settlement amount
                      </p>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =========================================================
          INDIVIDUAL BALANCES - SUPPORTING INFORMATION
      ========================================================== */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Individual balances
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Each member's current position in the group.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white">
          {balances.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-gray-500">
                No balance information available.
              </p>
            </div>
          ) : (
            balances.map((balance, index) => {
              const isPositive =
                balance.netBalancePaise > 0;

              const isNegative =
                balance.netBalancePaise < 0;

              return (
                <div
                  key={balance.userId}
                  className={`flex items-center justify-between px-5 py-4 ${
                    index !== balances.length - 1
                      ? "border-b border-gray-100"
                      : ""
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {balance.name}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {isPositive
                        ? "gets back"
                        : isNegative
                          ? "owes"
                          : "settled up"}
                    </p>
                  </div>

                  <p
                    className={`text-sm font-semibold ${
                      isPositive
                        ? "text-green-600"
                        : isNegative
                          ? "text-red-600"
                          : "text-gray-500"
                    }`}
                  >
                    {isPositive ? "+" : ""}₹
                    {Math.abs(balance.netBalance).toFixed(2)}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

export default GroupBalances;