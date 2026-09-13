import { useEffect, useState } from "react";

import { getGroupSettlements, createSettlement } from "../api/settlements.api";

import RecordSettlementModal from "./RecordSettlementModal";

function GroupSettlements({ groupId, members, onSettlementCreated,}) {
    const [settlements, setSettlements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const [isModalOpen, setIsModalOpen] =
        useState(false);

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const [submitError, setSubmitError] =
        useState("");

    async function handleCreateSettlement(data) {
        setSubmitError("");
        setIsSubmitting(true);

        try {
            await createSettlement(
                groupId,
                data
            );

            const response =
                await getGroupSettlements(groupId);

            setSettlements(
                response.data.settlements
            );

            onSettlementCreated?.();

            setIsModalOpen(false);
        } catch (error) {
            setSubmitError(
                error.response?.data?.error?.message ||
                "Unable to record settlement."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    useEffect(() => {
        async function loadSettlements() {
            setIsLoading(true);
            setError("");

            try {
                const data =
                    await getGroupSettlements(groupId);

                setSettlements(
                    data.data.settlements
                );
            } catch (error) {
                setError(
                    error.response?.data?.error?.message ||
                    "Unable to load settlements."
                );
            } finally {
                setIsLoading(false);
            }
        }

        loadSettlements();
    }, [groupId]);

    if (isLoading) {
        return (
            <div className="flex min-h-48 items-center justify-center">
                <p className="text-sm text-gray-500">
                    Loading settlements...
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
            <div className="mb-4 flex items-start justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                        Settlements
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Payments made between group members.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        setSubmitError("");
                        setIsModalOpen(true);
                    }}
                    className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                    Record settlement
                </button>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white">
                {settlements.length === 0 ? (
                    <div className="px-5 py-8 text-center">
                        <p className="text-sm text-gray-500">
                            No settlements recorded yet.
                        </p>
                    </div>
                ) : (
                    settlements.map(
                        (settlement, index) => (
                            <div
                                key={settlement.id}
                                className={`flex items-center justify-between px-5 py-4 ${index !==
                                    settlements.length - 1
                                    ? "border-b border-gray-100"
                                    : ""
                                    }`}
                            >
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium text-gray-900">
                                            {
                                                settlement.paid_by_name
                                            }
                                        </p>

                                        <span className="text-sm text-gray-400">
                                            →
                                        </span>

                                        <p className="text-sm font-medium text-gray-900">
                                            {
                                                settlement.paid_to_name
                                            }
                                        </p>
                                    </div>

                                    <p className="mt-1 text-xs text-gray-500">
                                        {new Date(
                                            settlement.created_at
                                        ).toLocaleString()}
                                    </p>
                                </div>

                                <p className="text-sm font-semibold text-gray-900">
                                    ₹{Number(
                                        settlement.amount
                                    ).toFixed(2)}
                                </p>
                            </div>
                        )
                    )
                )}
            </div>

            {isModalOpen && (
                <RecordSettlementModal
                    members={members}
                    onClose={() =>
                        setIsModalOpen(false)
                    }
                    onSubmit={handleCreateSettlement}
                    isSubmitting={isSubmitting}
                    error={submitError}
                />
            )}
        </div>
    );
}

export default GroupSettlements;