import { useEffect, useState } from "react";
import useAuthStore from "../stores/auth.store";
import useGroupStore from "../stores/group.store";

function Dashboard() {
  const user = useAuthStore((state) => state.user);

  const groups = useGroupStore((state) => state.groups);
  const isLoading = useGroupStore((state) => state.isLoading);
  const loadGroups = useGroupStore((state) => state.loadGroups);
  const getBalances = useGroupStore((state) => state.getBalances);

  const [youOwe, setYouOwe] = useState(0);
  const [youGet, setYouGet] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(true);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  useEffect(() => {
    async function loadDashboardBalances() {
      if (groups.length === 0) {
        setYouOwe(0);
        setYouGet(0);
        setBalanceLoading(false);
        return;
      }

      setBalanceLoading(true);

      try {
        const balances = await Promise.all(groups.map((group) => getBalances(group.id)));

        let owe = 0;
        let get = 0;

        balances.flat().forEach((balance) => {
          if (balance.userId !== user?.id) return;
          if (balance.netBalance < 0) owe += Math.abs(balance.netBalance);
          if (balance.netBalance > 0) get += balance.netBalance;
        });

        setYouOwe(owe);
        setYouGet(get);
      } catch (error) {
        console.error("Failed to load dashboard balances:", error);
      } finally {
        setBalanceLoading(false);
      }
    }

    loadDashboardBalances();
  }, [groups, getBalances, user?.id]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Good morning, {user?.name}</h1>
        <p className="mt-1 text-sm text-gray-500">Here's an overview of your expenses.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard title="You owe" value={youOwe} isLoading={balanceLoading} />
        <SummaryCard title="You get" value={youGet} isLoading={balanceLoading} />
        <SummaryCard title="Groups" value={groups.length} isLoading={isLoading} isCurrency={false} />
      </div>

      <div className="mt-8">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Your groups</h2>
          <p className="mt-1 text-sm text-gray-500">Groups you're currently part of.</p>
        </div>

        {isLoading ? (
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <p className="text-sm text-gray-500">Loading groups...</p>
          </div>
        ) : groups.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <p className="text-sm font-medium text-gray-900">No groups yet</p>
            <p className="mt-1 text-sm text-gray-500">Create a group to start splitting expenses.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {groups.slice(0, 4).map((group) => (
              <div
                key={group.id}
                className="rounded-xl border border-gray-200 bg-white p-5 transition hover:border-gray-300"
              >
                <h3 className="font-medium text-gray-900">{group.name}</h3>
                <p className="mt-1 text-sm text-gray-500">Expense group</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ title, value, isLoading, isCurrency = true }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <p className="text-sm text-gray-500">{title}</p>

      {isLoading ? (
        <div className="mt-3 h-8 w-24 animate-pulse rounded bg-gray-100" />
      ) : (
        <p className="mt-2 text-2xl font-semibold text-gray-900">
          {isCurrency ? `₹${value.toFixed(2)}` : value}
        </p>
      )}
    </div>
  );
}

export default Dashboard;