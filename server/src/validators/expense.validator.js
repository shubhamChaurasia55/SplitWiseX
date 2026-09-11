import { z } from "zod";

const baseExpenseFields = {
    description: z
        .string()
        .trim()
        .min(1, "Description is required")
        .max(255, "Description is too long"),

    amount: z
        .number()
        .positive("Amount must be greater than zero"),

    paidBy: z
        .string()
        .uuid("Invalid payer ID"),
};

const equalExpenseSchema = z.object({
    ...baseExpenseFields,

    splitType: z.literal("EQUAL"),

    participants: z
        .array(z.string().uuid("Invalid participant ID"))
        .min(1, "At least one participant is required"),
});

const exactExpenseSchema = z.object({
    ...baseExpenseFields,

    splitType: z.literal("EXACT"),

    splits: z
        .array(
            z.object({
                userId: z.string().uuid("Invalid user ID"),

                amount: z
                    .number()
                    .nonnegative("Split amount cannot be negative"),
            })
        )
        .min(1, "At least one split is required"),
});

const percentageExpenseSchema = z.object({
    ...baseExpenseFields,

    splitType: z.literal("PERCENTAGE"),

    splits: z
        .array(
            z.object({
                userId: z
                    .string()
                    .uuid("Invalid user ID"),

                percentage: z
                    .number()
                    .min(
                        0,
                        "Percentage cannot be negative"
                    )
                    .max(
                        100,
                        "Percentage cannot exceed 100"
                    ),
            })
        )
        .min(1, "At least one split is required"),
});

const createExpenseSchema = z.discriminatedUnion(
    "splitType",
    [
        equalExpenseSchema,
        exactExpenseSchema,
        percentageExpenseSchema,
    ]
);

export {
    createExpenseSchema,
};