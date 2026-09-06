import { z } from "zod";

export const createGroupSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Group name is required")
        .max(100, "Group name must be at most 100 characters"),
});

export const addMemberSchema = z.object({
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Invalid email address"),
});