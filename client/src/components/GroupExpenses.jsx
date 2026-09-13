import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getGroupExpenses, createExpense } from "../api/expenses.api";

import AddExpenseModal from "./AddExpenseModal";

function GroupExpenses({ members }) {
    const { groupId } = useParams();

    const [expenses, setExpenses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleCreateExpense(formData) {
        setSubmitError("");
        setIsSubmitting(true);

        try {
            await createExpense(
                groupId,
                formData
            );

            const data =
                await getGroupExpenses(groupId);

            setExpenses(
                data.data.expenses
            );

            setIsModalOpen(false);
        } catch (error) {
            setSubmitError(
                error.response?.data?.error?.message ||
                "Unable to create expense."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    useEffect(() => {
        async function loadExpenses() {
            setIsLoading(true);
            setError("");

            try {
                const data =
                    await getGroupExpenses(groupId);

                setExpenses(
                    data.data.expenses
                );
            } catch (error) {
                setError(
                    error.response?.data?.error?.message ||
                    "Unable to load expenses."
                );
            } finally {
                setIsLoading(false);
            }
        }

        loadExpenses();
    }, [groupId]);

    if (isLoading) {
        return (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
                <p className="text-sm text-gray-500">
                    Loading expenses...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                <p className="text-sm text-red-700">
                    {error}
                </p>
            </div>
        );
    }

    return (
        <div>

            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                        Expenses
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Track expenses for this group.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        setSubmitError("");
                        setIsModalOpen(true);
                    }}
                    className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
                >
                    + Add expense
                </button>
            </div>

            {/* Empty state */}
            {expenses.length === 0 && (
                <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
                    <h3 className="font-medium text-gray-900">
                        No expenses yet
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                        Add an expense to start splitting costs.
                    </p>
                </div>
            )}

            {/* Expense list */}
            {expenses.length > 0 && (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">

                    {expenses.map((expense, index) => (
                        <Link
                            key={expense.id}
                            to={`/groups/${groupId}/expenses/${expense.id}`}
                            className={`block px-5 py-4 transition hover:bg-gray-50 ${
                                index !== expenses.length - 1
                                    ? "border-b border-gray-100"
                                    : ""
                            }`}
                        >
                            <div className="flex items-center justify-between">

                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {expense.description}
                                    </p>

                                    <p className="mt-1 text-xs text-gray-500">
                                        Paid by{" "}
                                        {expense.paid_by_name}
                                    </p>
                                </div>

                                <div className="text-right">
                                    <p className="text-sm font-semibold text-gray-900">
                                        ₹{Number(
                                            expense.amount
                                        ).toFixed(2)}
                                    </p>

                                    <p className="mt-1 text-xs text-gray-400">
                                        {new Date(
                                            expense.created_at
                                        ).toLocaleDateString()}
                                    </p>
                                </div>

                            </div>
                        </Link>
                    ))}

                </div>
            )}

            {isModalOpen && (
                <AddExpenseModal
                    members={members}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleCreateExpense}
                    isSubmitting={isSubmitting}
                    error={submitError}
                />
            )}

        </div>
    );
}

export default GroupExpenses;