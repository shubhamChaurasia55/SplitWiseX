import { useEffect, useState } from "react";
import useGroupStore from "../stores/group.store";
import { Link } from "react-router-dom";

function Groups() {
    const groups = useGroupStore((state) => state.groups);
    const isLoading = useGroupStore((state) => state.isLoading);
    const loadGroups = useGroupStore((state) => state.loadGroups);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        loadGroups();
    }, [loadGroups]);

    return (
        <div>
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Groups</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage your expense groups.
                    </p>
                </div>

                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                    + New group
                </button>
            </div>

            {isLoading && (
                <div className="rounded-xl border border-gray-200 bg-white p-6">
                    <p className="text-sm text-gray-500">Loading groups...</p>
                </div>
            )}

            {!isLoading && groups.length === 0 && (
                <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
                    <h2 className="font-medium text-gray-900">No groups yet</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Create your first group to start splitting expenses.
                    </p>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                    >
                        Create group
                    </button>
                </div>
            )}

            {!isLoading && groups.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {groups.map((group) => (
                        <Link
                            key={group.id}
                            to={`/groups/${group.id}`}
                            className="block rounded-xl border border-gray-200 bg-white p-5 transition hover:border-gray-300"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="font-medium text-gray-900">{group.name}</h2>
                                    <p className="mt-1 text-sm text-gray-500">Expense group</p>
                                </div>
                                <span className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600">
                                    Group
                                </span>
                            </div>

                            <div className="mt-5 border-t border-gray-100 pt-4">
                                <p className="text-xs text-gray-400">Created</p>
                                <p className="mt-1 text-sm text-gray-600">
                                    {new Date(group.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {isCreateModalOpen && (
                <CreateGroupModal onClose={() => setIsCreateModalOpen(false)} />
            )}
        </div>
    );
}

function CreateGroupModal({ onClose }) {

    const createNewGroup = useGroupStore((state) => state.createNewGroup);

    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");

        const trimmedName = name.trim();

        if (!trimmedName) {
            setError("Group name is required.");
            return;
        }

        setIsSubmitting(true);

        try {
            await createNewGroup(trimmedName);

            onClose();
        } catch (error) {
            setError(
                error.response?.data?.error?.message ||
                "Unable to create group."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
            <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl">
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Create group</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Give your expense group a name.
                    </p>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="group-name"
                            className="mb-1.5 block text-sm font-medium text-gray-700"
                        >
                            Group name
                        </label>
                        <input
                            id="group-name"
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="e.g. Goa Trip"
                            required
                            maxLength={100}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting ? "Creating..." : "Create group"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Groups;
