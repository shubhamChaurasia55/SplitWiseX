import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import apiClient from "../api/client";
import useAuthStore from "../stores/auth.store";

import GroupExpenses from "../components/GroupExpenses";
import GroupBalances from "../components/GroupBalances";
import GroupSettlements from "../components/GroupSettlements";

import GroupAnalytics from "./GroupAnalytics";
import GroupMembers from "./GroupMembers";

function GroupDetails() {
    const { groupId } = useParams();

    const user = useAuthStore((state) => state.user);

    const [group, setGroup] = useState(null);
    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("EXPENSES");
    const [error, setError] = useState("");

    const [balanceRefreshKey, setBalanceRefreshKey] =
        useState(0);

    const loadGroup = useCallback(async () => {
        setIsLoading(true);
        setError("");

        try {
            const [groupResponse, membersResponse] =
                await Promise.all([
                    apiClient.get(`/groups/${groupId}`),
                    apiClient.get(`/groups/${groupId}/members`),
                ]);

            setGroup(groupResponse.data.data.group);
            setMembers(
                membersResponse.data.data.members
            );
        } catch (error) {
            setError(
                error.response?.data?.error?.message ||
                "Unable to load group."
            );
        } finally {
            setIsLoading(false);
        }
    }, [groupId]);

    useEffect(() => {
        loadGroup();
    }, [loadGroup]);

    if (isLoading) {
        return (
            <div className="flex min-h-64 items-center justify-center">
                <p className="text-sm text-gray-500">
                    Loading group...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                <p className="text-sm text-red-700">
                    {error}
                </p>
            </div>
        );
    }

    if (!group) {
        return null;
    }

    // Assuming your group API returns owner_id.
    const isOwner = group.created_by === user?.id;

    return (
        <div>
            {/* Back */}
            <Link
                to="/groups"
                className="text-sm text-gray-500 hover:text-gray-900"
            >
                ← Back to groups
            </Link>

            {/* Group header */}
            <div className="mt-6">
                <h1 className="text-2xl font-semibold text-gray-900">
                    {group.name}
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    {members.length}{" "}
                    {members.length === 1
                        ? "member"
                        : "members"}
                </p>
            </div>

            {/* Members */}
            <GroupMembers
                groupId={groupId}
                members={members}
                currentUserId={user?.id}
                isOwner={isOwner}
                onMembersChanged={loadGroup}
            />

            {/* Tabs */}
            <div className="mt-6 flex gap-6 border-b border-gray-200">
                <button
                    type="button"
                    onClick={() =>
                        setActiveTab("EXPENSES")
                    }
                    className={`pb-3 text-sm font-medium ${
                        activeTab === "EXPENSES"
                            ? "border-b-2 border-gray-900 text-gray-900"
                            : "text-gray-500 hover:text-gray-900"
                    }`}
                >
                    Expenses
                </button>

                <button
                    type="button"
                    onClick={() =>
                        setActiveTab("BALANCES")
                    }
                    className={`pb-3 text-sm font-medium ${
                        activeTab === "BALANCES"
                            ? "border-b-2 border-gray-900 text-gray-900"
                            : "text-gray-500 hover:text-gray-900"
                    }`}
                >
                    Balances
                </button>

                <button
                    type="button"
                    onClick={() =>
                        setActiveTab("SETTLEMENTS")
                    }
                    className={`pb-3 text-sm font-medium ${
                        activeTab === "SETTLEMENTS"
                            ? "border-b-2 border-gray-900 text-gray-900"
                            : "text-gray-500 hover:text-gray-900"
                    }`}
                >
                    Settlements
                </button>

                <button
                    type="button"
                    onClick={() =>
                        setActiveTab("ANALYTICS")
                    }
                    className={`pb-3 text-sm font-medium ${
                        activeTab === "ANALYTICS"
                            ? "border-b-2 border-gray-900 text-gray-900"
                            : "text-gray-500 hover:text-gray-900"
                    }`}
                >
                    Analytics
                </button>
            </div>

            {/* Tab content */}
            <div className="mt-6">
                {activeTab === "EXPENSES" && (
                    <GroupExpenses
                        members={members}
                    />
                )}

                {activeTab === "BALANCES" && (
                    <GroupBalances
                        groupId={groupId}
                        refreshKey={balanceRefreshKey}
                    />
                )}

                {activeTab === "SETTLEMENTS" && (
                    <GroupSettlements
                        groupId={groupId}
                        members={members}
                        onSettlementCreated={() =>
                            setBalanceRefreshKey(
                                (current) =>
                                    current + 1
                            )
                        }
                    />
                )}

                {activeTab === "ANALYTICS" && (
                    <GroupAnalytics
                        groupId={groupId}
                    />
                )}
            </div>
        </div>
    );
}

export default GroupDetails;