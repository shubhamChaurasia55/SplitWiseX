import { create } from "zustand";

import { getGroups, getGroupBalances, createGroup } from "../api/groups.api";

const useGroupStore = create((set) => ({
    groups: [],
    isLoading: false,

    loadGroups: async () => {
        set({
            isLoading: true,
        });

        try {
            const data = await getGroups();

            set({
                groups: data.data.groups,
            });
        } finally {
            set({
                isLoading: false,
            });
        }
    },

    getBalances: async (groupId) => {
        const data = await getGroupBalances(groupId);

        return data.data.balances;
    },

    createNewGroup: async (name) => {
        const data = await createGroup({
            name,
        });

        const newGroup = data.data.group;

        set((state) => ({
            groups: [
                newGroup,
                ...state.groups,
            ],
        }));

        return newGroup;
    },
}));

export default useGroupStore;
