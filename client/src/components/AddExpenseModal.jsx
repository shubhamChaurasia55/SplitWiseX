import { useEffect, useState } from "react";

function AddExpenseModal({
  members,
  onClose,
  onSubmit,
  isSubmitting,
  error,
  initialData = null,
}) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");

  const [splitType, setSplitType] = useState("EQUAL");

  const [participants, setParticipants] = useState([]);

  const [splits, setSplits] = useState({});

  /*
   * Prefill form when editing
   */
  useEffect(() => {
    if (!initialData) {
      return;
    }

    setDescription(initialData.description || "");
    setAmount(initialData.amount || "");
    setPaidBy(initialData.paidBy || "");
    setSplitType(initialData.splitType || "EQUAL");

    if (initialData.splitType === "EQUAL") {
      setParticipants(initialData.participants || []);

      setSplits({});
    } else {
      const initialSplits = {};

      (initialData.splits || []).forEach((split) => {
        initialSplits[split.userId] =
          initialData.splitType === "EXACT" ? split.amount : split.percentage;
      });

      setSplits(initialSplits);
      setParticipants([]);
    }
  }, [initialData]);

  function toggleParticipant(userId) {
    setParticipants((current) => {
      if (current.includes(userId)) {
        return current.filter((id) => id !== userId);
      }

      return [...current, userId];
    });
  }

  function handleSplitTypeChange(event) {
    const type = event.target.value;

    setSplitType(type);

    // Reset split-specific data
    setParticipants([]);
    setSplits({});
  }

  function handleSplitValueChange(userId, value) {
    setSplits((current) => ({
      ...current,
      [userId]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!description.trim()) {
      return;
    }

    if (!amount || Number(amount) <= 0) {
      return;
    }

    if (!paidBy) {
      return;
    }

    if (splitType === "EQUAL" && participants.length === 0) {
      return;
    }

    if (splitType === "EXACT" && exactTotal !== Number(amount)) {
      return;
    }

    if (splitType === "PERCENTAGE" && percentageTotal !== 100) {
      return;
    }

    /*
     * Equal split
     */
    if (splitType === "EQUAL") {
      onSubmit({
        description: description.trim(),
        amount: Number(amount),
        paidBy,
        splitType: "EQUAL",
        participants,
      });

      return;
    }

    /*
     * Exact / Percentage split
     */
    const formattedSplits = Object.entries(splits).map(([userId, value]) => {
      if (splitType === "EXACT") {
        return {
          userId,
          amount: Number(value),
        };
      }

      return {
        userId,
        percentage: Number(value),
      };
    });

    onSubmit({
      description: description.trim(),
      amount: Number(amount),
      paidBy,
      splitType,
      splits: formattedSplits,
    });
  }

  const exactTotal = Object.values(splits).reduce((total, value) => {
    return total + (Number(value) || 0);
  }, 0);

  const percentageTotal = Object.values(splits).reduce((total, value) => {
    return total + (Number(value) || 0);
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-gray-200 bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {initialData ? "Edit expense" : "Add expense"}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {initialData
              ? "Update the expense details and split."
              : "Add an expense and choose how it should be split."}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Description */}
          <div>
            <label
              htmlFor="expense-description"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Description
            </label>

            <input
              id="expense-description"
              type="text"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="e.g. Goa dinner"
              maxLength={255}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
            />
          </div>

          {/* Amount */}
          <div>
            <label
              htmlFor="expense-amount"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Amount
            </label>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                ₹
              </span>

              <input
                id="expense-amount"
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0.00"
                required
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-8 pr-3 text-sm text-gray-900 outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
              />
            </div>
          </div>

          {/* Paid by */}
          <div>
            <label
              htmlFor="expense-paid-by"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Paid by
            </label>

            <select
              id="expense-paid-by"
              value={paidBy}
              onChange={(event) => setPaidBy(event.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
            >
              <option value="">Select member</option>

              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          {/* Split type */}
          <div>
            <label
              htmlFor="split-type"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Split type
            </label>

            <select
              id="split-type"
              value={splitType}
              onChange={handleSplitTypeChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
            >
              <option value="EQUAL">Equal</option>

              <option value="EXACT">Exact amounts</option>

              <option value="PERCENTAGE">Percentage</option>
            </select>
          </div>

          {/* Equal split */}
          {splitType === "EQUAL" && (
            <div>
              <div className="mb-2">
                <p className="text-sm font-medium text-gray-700">
                  Participants
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Select everyone sharing this expense.
                </p>
              </div>

              <div className="space-y-2 rounded-lg border border-gray-200 p-3">
                {members.map((member) => (
                  <label
                    key={member.id}
                    className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={participants.includes(member.id)}
                      onChange={() => toggleParticipant(member.id)}
                      className="h-4 w-4 rounded border-gray-300"
                    />

                    <span className="text-sm text-gray-900">{member.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Exact / Percentage */}
          {(splitType === "EXACT" || splitType === "PERCENTAGE") && (
            <div>
              <div className="mb-2">
                <p className="text-sm font-medium text-gray-700">
                  {splitType === "EXACT"
                    ? "Split amounts"
                    : "Split percentages"}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Enter a value for each participant.
                </p>
              </div>

              <div className="space-y-2 rounded-lg border border-gray-200 p-3">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{member.name}</p>
                    </div>

                    <div className="relative w-32">
                      {splitType === "EXACT" && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                          ₹
                        </span>
                      )}

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        max={splitType === "PERCENTAGE" ? "100" : undefined}
                        value={splits[member.id] || ""}
                        onChange={(event) =>
                          handleSplitValueChange(member.id, event.target.value)
                        }
                        placeholder="0"
                        className={`w-full rounded-lg border border-gray-300 py-2 text-sm text-gray-900 outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100 ${
                          splitType === "EXACT" ? "pl-8 pr-3" : "px-3 pr-8"
                        }`}
                      />

                      {splitType === "PERCENTAGE" && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                          %
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Split summary */}
              {splitType === "EXACT" && (
                <div className="mt-3 flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                  <span className="text-xs text-gray-500">Split total</span>

                  <span
                    className={`text-sm font-medium ${
                      exactTotal === Number(amount)
                        ? "text-gray-900"
                        : "text-red-600"
                    }`}
                  >
                    ₹{exactTotal.toFixed(2)} / ₹{Number(amount || 0).toFixed(2)}
                  </span>
                </div>
              )}

              {splitType === "PERCENTAGE" && (
                <div className="mt-3 flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                  <span className="text-xs text-gray-500">
                    Percentage total
                  </span>

                  <span
                    className={`text-sm font-medium ${
                      percentageTotal === 100 ? "text-gray-900" : "text-red-600"
                    }`}
                  >
                    {percentageTotal.toFixed(2)}% / 100%
                  </span>
                </div>
              )}
            </div>
          )}

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
                (splitType === "EQUAL" && participants.length === 0) ||
                (splitType === "EXACT" && exactTotal !== Number(amount)) ||
                (splitType === "PERCENTAGE" && percentageTotal !== 100)
              }
              className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? initialData
                  ? "Saving..."
                  : "Adding..."
                : initialData
                  ? "Save changes"
                  : "Add expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddExpenseModal;
