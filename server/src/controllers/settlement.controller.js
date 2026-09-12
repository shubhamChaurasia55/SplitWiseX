import {
    createSettlementSchema,
} from "../validators/settlement.validator.js";

import {
    createNewSettlement,
} from "../services/settlement.service.js";

import {
    findSettlementsByGroupId,
} from "../repositories/settlement.repository.js";

import {
    findGroupMember,
} from "../repositories/group-member.repository.js";

import { AppError } from "../utils/AppError.js";

export async function createSettlement(req, res, next) {
    try {
        const result =
            createSettlementSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid settlement data.",
                    details: result.error.issues,
                },
            });
        }

        const settlement =
            await createNewSettlement({
                groupId: req.params.groupId,
                requesterId: req.user.id,
                ...result.data,
            });

        return res.status(201).json({
            success: true,
            data: settlement,
        });
    } catch (error) {
        next(error);
    }
}

export async function getSettlements(req, res, next) {
    try {
        const member = await findGroupMember({
            groupId: req.params.groupId,
            userId: req.user.id,
        });

        if (!member) {
            throw new AppError(
                403,
                "GROUP_ACCESS_DENIED",
                "You are not a member of this group."
            );
        }

        const settlements =
            await findSettlementsByGroupId(
                req.params.groupId
            );

        return res.status(200).json({
            success: true,
            data: {
                settlements,
            },
        });
    } catch (error) {
        next(error);
    }
}