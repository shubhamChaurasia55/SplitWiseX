import apiClient from "./client";

export async function getGroupExpenses(groupId) {
    const response = await apiClient.get(
        `/groups/${groupId}/expenses`
    );

    return response.data;
}

export async function createExpense(groupId, data) {
    const response = await apiClient.post(
        `/groups/${groupId}/expenses`,
        data
    );

    return response.data;
}

export async function getExpense(
    groupId,
    expenseId
) {
    const response = await apiClient.get(
        `/groups/${groupId}/expenses/${expenseId}`
    );

    return response.data;
}

export async function updateExpense(
    groupId,
    expenseId,
    data
) {
    const response = await apiClient.put(
        `/groups/${groupId}/expenses/${expenseId}`,
        data
    );

    return response.data;
}

export async function deleteExpense(
    groupId,
    expenseId
) {
    const response = await apiClient.delete(
        `/groups/${groupId}/expenses/${expenseId}`
    );

    return response.data;
}