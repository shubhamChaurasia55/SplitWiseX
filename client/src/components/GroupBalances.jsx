import { useEffect, useState } from "react";

import { getGroupBalances, getGroupDebts } from "../api/groups.api";

function GroupBalances({ groupId, refreshKey, }) {
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
          error.response?.data?.error?.message || "Unable to load balances.",
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
        <p className="text-sm text-gray-500">Loading balances...</p>
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
      {/* Balances */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Balances</h2>

          <p className="mt-1 text-sm text-gray-500">
            See who owes money and who should receive money.
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
              const isPositive = balance.netBalancePaise > 0;

              const isNegative = balance.netBalancePaise < 0;

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
      </div>

      {/* Simplified debts */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Simplified debts
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            A simpler way to settle the group.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white">
          {debts.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-gray-500">Everyone is settled up.</p>
            </div>
          ) : (
            debts.map((debt, index) => (
              <div
                key={`${debt.from.userId}-${debt.to.userId}-${index}`}
                className={`flex items-center justify-between px-5 py-4 ${
                  index !== debts.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {debt.from.name}
                  </span>

                  <span className="text-sm text-gray-400">→</span>

                  <span className="text-sm font-medium text-gray-900">
                    {debt.to.name}
                  </span>
                </div>

                <p className="text-sm font-semibold text-gray-900">
                  ₹{Number(debt.amount).toFixed(2)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default GroupBalances;
