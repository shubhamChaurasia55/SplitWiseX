
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
            setMembers(membersResponse.data.data.members);
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

    if (!group) return null;

    const isOwner = group.created_by === user?.id;

    const tabs = [
        { id: "EXPENSES", label: "Expenses" },
        { id: "BALANCES", label: "Balances" },
        { id: "SETTLEMENTS", label: "Settlements" },
        { id: "ANALYTICS", label: "Analytics" },
        { id: "MEMBERS", label: "Members" },
    ];

    return (
        <div className="mx-auto max-w-7xl">

            {/* Back */}

            <Link
                to="/groups"
                className="text-sm text-gray-500 hover:text-gray-900"
            >
                ← Back to groups
            </Link>

            {/* Hero */}

            <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 md:p-6">

                <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">

                    <div>
                        <p className="text-sm font-medium text-gray-500">
                            Expense Group
                        </p>

                        <div className="mt-1 flex flex-wrap items-center gap-3">

                            <h1 className="text-3xl font-semibold text-gray-900">
                                {group.name}
                            </h1>

                            {isOwner && (
                                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                                    Owner
                                </span>
                            )}

                        </div>

                        <p className="mt-3 text-sm text-gray-500">
                            Created{" "}
                            {new Date(
                                group.created_at
                            ).toLocaleDateString()}
                        </p>
                    </div>

                    {/* Members preview */}

                    <div className="rounded-xl bg-gray-50 px-5 py-4 md:min-w-64">

                        <p className="text-sm text-gray-500">
                            Group members
                        </p>

                        <div className="mt-2 flex items-center gap-3">

                            <div className="flex -space-x-2">

                                {members.slice(0, 4).map((member) => (

                                    <div
                                        key={member.id}
                                        className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-gray-900 text-xs font-semibold text-white"
                                    >
                                        {member.name
                                            ?.charAt(0)
                                            .toUpperCase()}
                                    </div>

                                ))}

                            </div>

                            <div>

                                <p className="text-lg font-semibold text-gray-900">
                                    {members.length}
                                </p>

                                <p className="text-xs text-gray-500">
                                    members
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

            {/* Summary cards */}

            {/* <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                <div className="rounded-xl border border-gray-200 bg-white p-5">

                    <p className="text-sm text-gray-500">
                        Total Members
                    </p>

                    <p className="mt-2 text-3xl font-semibold text-gray-900">
                        {members.length}
                    </p>

                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5">

                    <p className="text-sm text-gray-500">
                        Your Role
                    </p>

                    <p className="mt-2 text-xl font-semibold text-gray-900">
                        {isOwner ? "Owner" : "Member"}
                    </p>

                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5">

                    <p className="text-sm text-gray-500">
                        Group Created
                    </p>

                    <p className="mt-2 text-xl font-semibold text-gray-900">
                        {new Date(
                            group.created_at
                        ).toLocaleDateString()}
                    </p>

                </div>

            </div> */}

            {/* Tabs */}

            <div className="mt-8 overflow-x-auto border-b border-gray-200">

                <div className="flex min-w-max gap-7">

                    {tabs.map((tab) => (

                        <button
                            key={tab.id}
                            type="button"
                            onClick={() =>
                                setActiveTab(tab.id)
                            }
                            className={`border-b-2 pb-3 text-sm font-medium transition ${
                                activeTab === tab.id
                                    ? "border-gray-900 text-gray-900"
                                    : "border-transparent text-gray-500 hover:text-gray-900"
                            }`}
                        >
                            {tab.label}
                        </button>

                    ))}

                </div>

            </div>

            {/* Content */}

            <div className="mt-6">

                {activeTab === "EXPENSES" && (
                    <GroupExpenses members={members} />
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
                                (current) => current + 1
                            )
                        }
                    />
                )}

                {activeTab === "ANALYTICS" && (
                    <GroupAnalytics groupId={groupId} />
                )}

                {activeTab === "MEMBERS" && (
                    <GroupMembers
                        groupId={groupId}
                        members={members}
                        currentUserId={user?.id}
                        isOwner={isOwner}
                        onMembersChanged={loadGroup}
                    />
                )}

            </div>

        </div>
    );
}

export default GroupDetails;