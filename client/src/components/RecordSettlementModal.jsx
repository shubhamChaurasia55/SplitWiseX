import { useState } from "react";

function RecordSettlementModal({
    members,
    onClose,
    onSubmit,
    isSubmitting,
    error,
}) {
    const [paidBy, setPaidBy] = useState("");
    const [paidTo, setPaidTo] = useState("");
    const [amount, setAmount] = useState("");

    function handleSubmit(event) {
        event.preventDefault();

        if (!paidBy || !paidTo) {
            return;
        }

        if (paidBy === paidTo) {
            return;
        }

        if (!amount || Number(amount) <= 0) {
            return;
        }

        onSubmit({
            paidBy,
            paidTo,
            amount: Number(amount),
        });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
            <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl">

                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Record settlement
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Record a payment between group members.
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >
                    {/* Paid by */}
                    <div>
                        <label
                            htmlFor="settlement-paid-by"
                            className="mb-1.5 block text-sm font-medium text-gray-700"
                        >
                            Paid by
                        </label>

                        <select
                            id="settlement-paid-by"
                            value={paidBy}
                            onChange={(event) =>
                                setPaidBy(
                                    event.target.value
                                )
                            }
                            required
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
                        >
                            <option value="">
                                Select member
                            </option>

                            {members.map((member) => (
                                <option
                                    key={member.id}
                                    value={member.id}
                                >
                                    {member.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Paid to */}
                    <div>
                        <label
                            htmlFor="settlement-paid-to"
                            className="mb-1.5 block text-sm font-medium text-gray-700"
                        >
                            Paid to
                        </label>

                        <select
                            id="settlement-paid-to"
                            value={paidTo}
                            onChange={(event) =>
                                setPaidTo(
                                    event.target.value
                                )
                            }
                            required
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
                        >
                            <option value="">
                                Select member
                            </option>

                            {members.map((member) => (
                                <option
                                    key={member.id}
                                    value={member.id}
                                    disabled={member.id === paidBy}
                                >
                                    {member.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Amount */}
                    <div>
                        <label
                            htmlFor="settlement-amount"
                            className="mb-1.5 block text-sm font-medium text-gray-700"
                        >
                            Amount
                        </label>

                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                ₹
                            </span>

                            <input
                                id="settlement-amount"
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={amount}
                                onChange={(event) =>
                                    setAmount(
                                        event.target.value
                                    )
                                }
                                placeholder="0.00"
                                required
                                className="w-full rounded-lg border border-gray-300 py-2.5 pl-8 pr-3 text-sm text-gray-900 outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={
                                isSubmitting ||
                                !paidBy ||
                                !paidTo ||
                                paidBy === paidTo ||
                                !amount ||
                                Number(amount) <= 0
                            }
                            className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting
                                ? "Recording..."
                                : "Record settlement"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default RecordSettlementModal;