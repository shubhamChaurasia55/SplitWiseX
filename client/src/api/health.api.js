import apiClient from "./client";

export const getHealth = async () => {
    const response = await apiClient.get("/health");

    return response.data;
};