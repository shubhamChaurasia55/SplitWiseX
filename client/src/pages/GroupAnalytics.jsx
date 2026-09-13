import { useEffect, useState } from "react";
import { getGroupAnalytics } from "../api/analytics.api";

function GroupAnalytics({ groupId }) {
    const [analytics, setAnalytics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadAnalytics() {
            setIsLoading(true);
            setError("");

            try {
                const response = await getGroupAnalytics(groupId);

                setAnalytics(response.data);
            } catch (error) {
                setError(
                    error.response?.data?.error?.message ||
                    "Unable to load analytics."
                );
            } finally {
                setIsLoading(false);
            }
        }

        loadAnalytics();
    }, [groupId]);

    if (isLoading) {
        return (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
                <p className="text-sm text-gray-500">
                    Loading analytics...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-600">
                    {error}
                </p>
            </div>
        );
    }

    if (!analytics) {
        return null;
    }

    const { summary, memberSpending } = analytics;

    return (
        <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <p className="text-sm text-gray-500">
                        Total expenses
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-gray-900">
                        {summary.totalExpenses}
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <p className="text-sm text-gray-500">
                        Total amount
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-gray-900">
                        ₹{summary.totalAmount.toFixed(2)}
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <p className="text-sm text-gray-500">
                        Average expense
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-gray-900">
                        ₹{summary.averageExpense.toFixed(2)}
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <p className="text-sm text-gray-500">
                        Highest expense
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-gray-900">
                        ₹{summary.highestExpense.toFixed(2)}
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <p className="text-sm text-gray-500">
                        Lowest expense
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-gray-900">
                        ₹{summary.lowestExpense.toFixed(2)}
                    </p>
                </div>
            </div>

            {/* Member spending */}
            <div className="rounded-xl border border-gray-200 bg-white">
                <div className="border-b border-gray-200 px-6 py-4">
                    <h3 className="font-semibold text-gray-900">
                        Member spending
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                        Total amount paid by each member
                    </p>
                </div>

                <div className="divide-y divide-gray-100">
                    {memberSpending.map((member) => (
                        <div
                            key={member.userId}
                            className="flex items-center justify-between px-6 py-4"
                        >
                            <p className="text-sm font-medium text-gray-900">
                                {member.name}
                            </p>

                            <p className="text-sm font-semibold text-gray-900">
                                ₹{member.totalPaid.toFixed(2)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default GroupAnalytics;