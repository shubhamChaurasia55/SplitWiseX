import apiClient from "./client";

export async function getGroupAnalytics(groupId) {
    const response = await apiClient.get(
        `/groups/${groupId}/analytics`
    );

    return response.data;
}