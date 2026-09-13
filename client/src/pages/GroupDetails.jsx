import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import apiClient from "../api/client";
import GroupExpenses from "../components/GroupExpenses";
import GroupBalances from "../components/GroupBalances";

function GroupDetails() {
    const { groupId } = useParams();

    const [group, setGroup] = useState(null);
    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("EXPENSES");
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadGroup() {
            setIsLoading(true);
            setError("");

            try {
                const [groupResponse, membersResponse] = await Promise.all([
                    apiClient.get(`/groups/${groupId}`),
                    apiClient.get(`/groups/${groupId}/members`),
                ]);

                setGroup(groupResponse.data.data.group);
                setMembers(membersResponse.data.data.members);
            } catch (error) {
                setError(
                    error.response?.data?.error?.message || "Unable to load group.",
                );
            } finally {
                setIsLoading(false);
            }
        }

        loadGroup();
    }, [groupId]);

    if (isLoading) {
        return (
            <div className="flex min-h-64 items-center justify-center">
                <p className="text-sm text-gray-500">Loading group...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                <p className="text-sm text-red-700">{error}</p>
            </div>
        );
    }

    if (!group) {
        return null;
    }

    return (
        <div>
            <Link to="/groups" className="text-sm text-gray-500 hover:text-gray-900">
                ← Back to groups
            </Link>

            <div className="mt-6 flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">{group.name}</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        {members.length} {members.length === 1 ? "member" : "members"}
                    </p>
                </div>
            </div>

            <div className="flex gap-6 border-b border-gray-200">
                <button
                    type="button"
                    onClick={() => setActiveTab("EXPENSES")}
                    className={`pb-3 text-sm font-medium ${activeTab === "EXPENSES"
                        ? "border-b-2 border-gray-900 text-gray-900"
                        : "text-gray-500 hover:text-gray-900"
                        }`}
                >
                    Expenses
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab("BALANCES")}
                    className={`pb-3 text-sm font-medium ${activeTab === "BALANCES"
                        ? "border-b-2 border-gray-900 text-gray-900"
                        : "text-gray-500 hover:text-gray-900"
                        }`}
                >
                    Balances
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab("SETTLEMENTS")}
                    className={`pb-3 text-sm font-medium ${activeTab === "SETTLEMENTS"
                        ? "border-b-2 border-gray-900 text-gray-900"
                        : "text-gray-500 hover:text-gray-900"
                        }`}
                >
                    Settlements
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab("ANALYTICS")}
                    className={`pb-3 text-sm font-medium ${activeTab === "ANALYTICS"
                        ? "border-b-2 border-gray-900 text-gray-900"
                        : "text-gray-500 hover:text-gray-900"
                        }`}
                >
                    Analytics
                </button>
            </div>

            <div className="mt-6">
                {activeTab === "EXPENSES" && (
                    <GroupExpenses members={members} />
                )}

                {activeTab === "BALANCES" && (
                    <GroupBalances groupId={groupId} />
                )}

                {activeTab === "SETTLEMENTS" && (
                    <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
                        <p className="text-sm text-gray-500">
                            Settlements coming next.
                        </p>
                    </div>
                )}

                {activeTab === "ANALYTICS" && (
                    <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
                        <p className="text-sm text-gray-500">
                            Analytics coming next.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

function Tab({ label, active = false }) {
    return (
        <button
            type="button"
            className={`border-b-2 pb-3 text-sm font-medium ${active
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
        >
            {label}
        </button>
    );
}

export default GroupDetails;
