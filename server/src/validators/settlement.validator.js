import { z } from "zod";

const createSettlementSchema = z.object({
    paidBy: z
        .string()
        .uuid("Invalid payer ID"),

    paidTo: z
        .string()
        .uuid("Invalid receiver ID"),

    amount: z
        .number()
        .positive("Settlement amount must be greater than zero"),
});

export {
    createSettlementSchema,
};