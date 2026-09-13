import apiClient from "./client";

export async function getGroupSettlements(groupId) {
    const response = await apiClient.get(
        `/groups/${groupId}/settlements`
    );

    return response.data;
}

export async function createSettlement(
    groupId,
    data
) {
    const response = await apiClient.post(
        `/groups/${groupId}/settlements`,
        data
    );

    return response.data;
}