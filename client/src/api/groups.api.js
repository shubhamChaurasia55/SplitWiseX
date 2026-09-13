import apiClient from "./client";

export async function getGroups() {
    const response = await apiClient.get("/groups");

    return response.data;
}

export async function getGroupBalances(groupId) {
    const response = await apiClient.get(
        `/groups/${groupId}/balances`
    );

    return response.data;
}

export async function createGroup(data) {
    const response = await apiClient.post(
        "/groups",
        data
    );

    return response.data;
}

export async function getGroupMembers(groupId) {
    const response = await apiClient.get(
        `/groups/${groupId}/members`
    );

    return response.data;
}

export async function getGroupDebts(groupId) {
    const response = await apiClient.get(
        `/groups/${groupId}/debts`
    );

    return response.data;
}

export async function addGroupMember(groupId, email) {
    const response = await apiClient.post(
        `/groups/${groupId}/members`,
        { email }
    );

    return response.data;
}

export async function removeGroupMember(groupId, userId) {
    const response = await apiClient.delete(
        `/groups/${groupId}/members/${userId}`
    );

    return response.data;
}