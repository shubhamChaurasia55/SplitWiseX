import { useState } from "react";
import {
    addGroupMember,
    removeGroupMember,
} from "../api/groups.api";

function GroupMembers({
    groupId,
    members,
    currentUserId,
    isOwner,
    onMembersChanged,
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    async function handleAddMember(event) {
        event.preventDefault();

        setError("");
        setIsSubmitting(true);

        try {
            await addGroupMember(groupId, email);

            setEmail("");
            setIsModalOpen(false);

            await onMembersChanged?.();
        } catch (error) {
            setError(
                error.response?.data?.error?.message ||
                    "Unable to add member."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleRemoveMember(userId) {
        const confirmed = window.confirm(
            "Are you sure you want to remove this member?"
        );

        if (!confirmed) {
            return;
        }

        setError("");

        try {
            await removeGroupMember(groupId, userId);

            await onMembersChanged?.();
        } catch (error) {
            setError(
                error.response?.data?.error?.message ||
                    "Unable to remove member."
            );
        }
    }

    return (
        <>
            <div className="mt-6 rounded-xl border border-gray-200 bg-white">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <div>
                        <h3 className="font-semibold text-gray-900">
                            Members
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                            People in this expense group
                        </p>
                    </div>

                    {isOwner && (
                        <button
                            type="button"
                            onClick={() => {
                                setError("");
                                setEmail("");
                                setIsModalOpen(true);
                            }}
                            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                        >
                            + Add member
                        </button>
                    )}
                </div>

                {/* Error */}
                {error && (
                    <div className="border-b border-red-200 bg-red-50 px-6 py-3">
                        <p className="text-sm text-red-600">
                            {error}
                        </p>
                    </div>
                )}

                {/* Members */}
                <div className="divide-y divide-gray-100">
                    {members.map((member) => (
                        <div
                            key={member.id}
                            className="flex items-center justify-between px-6 py-4"
                        >
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-gray-900">
                                        {member.name}
                                    </p>

                                    {member.role === "OWNER" && (
                                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                                            Owner
                                        </span>
                                    )}
                                </div>

                                <p className="mt-1 text-sm text-gray-500">
                                    {member.email}
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                {member.id === currentUserId && (
                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                                        You
                                    </span>
                                )}

                                {isOwner &&
                                    member.id !== currentUserId &&
                                    member.role !== "OWNER" && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRemoveMember(
                                                    member.id
                                                )
                                            }
                                            className="text-sm font-medium text-red-600 hover:underline"
                                        >
                                            Remove
                                        </button>
                                    )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add member modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Add member
                        </h2>

                        <p className="mt-2 text-sm text-gray-500">
                            Enter the email address of an existing
                            SplitWiseX user.
                        </p>

                        {error && (
                            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                                <p className="text-sm text-red-600">
                                    {error}
                                </p>
                            </div>
                        )}

                        <form
                            onSubmit={handleAddMember}
                            className="mt-6"
                        >
                            <label className="block text-sm font-medium text-gray-700">
                                Email
                            </label>

                            <input
                                type="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                placeholder="user@example.com"
                                required
                                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-500"
                            />

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsModalOpen(false)
                                    }
                                    disabled={isSubmitting}
                                    className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        isSubmitting ||
                                        !email.trim()
                                    }
                                    className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isSubmitting
                                        ? "Adding..."
                                        : "Add member"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default GroupMembers;