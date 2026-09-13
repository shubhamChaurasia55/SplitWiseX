import { useEffect, useState } from "react";
import {
    Link,
    useParams,
    useNavigate,
} from "react-router-dom";

import {
    getExpense,
    deleteExpense,
    updateExpense,
} from "../api/expenses.api";

import { getGroupMembers } from "../api/groups.api";

import AddExpenseModal from "../components/AddExpenseModal";

import useAuthStore from "../stores/auth.store";

function ExpenseDetails() {
    const user = useAuthStore((state) => state.user);

    const { groupId, expenseId } = useParams();

    const [expense, setExpense] = useState(null);
    const [splits, setSplits] = useState([]);
    const [members, setMembers] = useState([]);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const [isUpdating, setIsUpdating] = useState(false);

    const [updateError, setUpdateError] = useState("");

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        async function loadExpense() {
            setIsLoading(true);
            setError("");

            try {
                const [expenseData, membersData] = await Promise.all([
                    getExpense(groupId, expenseId),
                    getGroupMembers(groupId),
                ]);

                setExpense(expenseData.data.expense);
                setSplits(expenseData.data.splits);
                setMembers(membersData.data.members);
            } catch (error) {
                setError(
                    error.response?.data?.error?.message || "Unable to load expense.",
                );
            } finally {
                setIsLoading(false);
            }
        }

        loadExpense();
    }, [groupId, expenseId]);

    if (isLoading) {
        return (
            <div className="flex min-h-64 items-center justify-center">
                <p className="text-sm text-gray-500">Loading expense...</p>
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

    if (!expense) {
        return null;
    }

    const isCreator = user?.id === expense.created_by;

    const editData = {
        description: expense.description,

        amount: expense.amount,

        paidBy: expense.paid_by,

        splitType: expense.split_type,

        participants:
            expense.split_type === "EQUAL"
                ? splits.map((split) => split.user_id)
                : [],

        splits:
            expense.split_type !== "EQUAL"
                ? splits.map((split) => ({
                    userId: split.user_id,
                    amount: split.amount,
                    percentage: split.percentage,
                }))
                : [],
    };

    async function handleUpdate(formData) {
        setUpdateError("");
        setIsUpdating(true);

        try {
            await updateExpense(groupId, expenseId, formData);

            const data = await getExpense(groupId, expenseId);

            setExpense(data.data.expense);

            setSplits(data.data.splits);

            setIsEditModalOpen(false);
        } catch (error) {
            setUpdateError(
                error.response?.data?.error?.message || "Unable to update expense.",
            );
        } finally {
            setIsUpdating(false);
        }
    }

    async function handleDelete() {
        const confirmed = window.confirm(
            "Are you sure you want to delete this expense?",
        );

        if (!confirmed) {
            return;
        }

        try {
            await deleteExpense(groupId, expenseId);

            navigate(`/groups/${groupId}`);
        } catch (error) {
            setError(
                error.response?.data?.error?.message || "Unable to delete expense.",
            );
        }
    }

    return (
        <div className="max-w-3xl">
            {/* Back */}
            <Link
                to={`/groups/${groupId}`}
                className="text-sm text-gray-500 hover:text-gray-900"
            >
                ← Back to group
            </Link>

            {/* Header */}
            <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
                {/* Expense information */}
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm text-gray-500">Expense</p>

                        <h1 className="mt-1 text-2xl font-semibold text-gray-900">
                            {expense.description}
                        </h1>

                        <p className="mt-2 text-sm text-gray-500">
                            Paid by{" "}
                            <span className="font-medium text-gray-700">
                                {expense.paid_by_name}
                            </span>
                        </p>
                    </div>

                    <div className="text-right">
                        <p className="text-2xl font-semibold text-gray-900">
                            ₹{Number(expense.amount).toFixed(2)}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">{expense.split_type}</p>
                    </div>
                </div>

                {/* Actions */}
                {isCreator && (
                    <div className="mt-5 flex gap-2 border-t border-gray-100 pt-5">
                        <button
                            type="button"
                            onClick={() => {
                                setUpdateError("");
                                setIsEditModalOpen(true);
                            }}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                            Edit
                        </button>

                        <button
                            type="button"
                            onClick={handleDelete}
                            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                        >
                            Delete
                        </button>
                    </div>
                )}
            </div>

            {/* Splits */}
            <div className="mt-6">
                <div className="mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Split</h2>

                    <p className="mt-1 text-sm text-gray-500">
                        How this expense is divided.
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white">
                    {splits.length === 0 ? (
                        <div className="px-5 py-6 text-sm text-gray-500">
                            No participants found.
                        </div>
                    ) : (
                        splits.map((split, index) => (
                            <div
                                key={split.user_id}
                                className={`flex items-center justify-between px-5 py-4 ${index !== splits.length - 1 ? "border-b border-gray-100" : ""
                                    }`}
                            >
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {split.name}
                                    </p>

                                    {split.percentage !== null &&
                                        split.percentage !== undefined && (
                                            <p className="mt-0.5 text-xs text-gray-500">
                                                {Number(split.percentage).toFixed(2)}%
                                            </p>
                                        )}
                                </div>

                                <p className="text-sm font-semibold text-gray-900">
                                    ₹{Number(split.amount).toFixed(2)}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Metadata */}
            <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Created</span>

                    <span className="text-sm text-gray-700">
                        {new Date(expense.created_at).toLocaleString()}
                    </span>
                </div>

                <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-gray-500">Split type</span>

                    <span className="text-sm font-medium text-gray-700">
                        {expense.split_type}
                    </span>
                </div>
            </div>

            {isEditModalOpen && (
                <AddExpenseModal
                    members={members}
                    initialData={editData}
                    onClose={() => setIsEditModalOpen(false)}
                    onSubmit={handleUpdate}
                    isSubmitting={isUpdating}
                    error={updateError}
                />
            )}
        </div>
    );
}

export default ExpenseDetails;
