import { create } from "zustand";

import {
    loginUser,
    registerUser,
    logoutUser,
    getCurrentUser,
} from "../api/auth.api";


const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,

    login: async (credentials) => {
        const data =
            await loginUser(credentials);

        set({
            user: data.data.user,
            isAuthenticated: true,
        });
    },

    register: async (userData) => {
        const data =
            await registerUser(userData);

        set({
            user: data.data.user,
            isAuthenticated: true,
        });
    },

    logout: async () => {
        await logoutUser();

        set({
            user: null,
            isAuthenticated: false,
        });
    },

    loadUser: async () => {
        try {
            const data =
                await getCurrentUser();

            set({
                user: data.data.user,
                isAuthenticated: true,
            });
        } catch (error) {
            set({
                user: null,
                isAuthenticated: false,
            });
        } finally {
            set({
                isLoading: false,
            });
        }
    },
}));

export default useAuthStore;