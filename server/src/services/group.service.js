import { withTransaction } from "../utils/transaction.js";

import { createGroup, findGroupByIdForUser, findGroupsByUserId } from "../repositories/group.repository.js";
import { findUserByEmail } from "../repositories/user.repository.js";

import { addGroupMember, findGroupMember, findGroupMembers, removeGroupMember } from "../repositories/group-member.repository.js";
import { AppError } from "../utils/AppError.js";
import pool from "../config/db.js";


export async function createNewGroup({ name, userId }) {

    return await withTransaction(async (client) => {

        const group = await createGroup(client, {
            name,
            createdBy: userId,
        });

        await addGroupMember(client, {
            groupId: group.id,
            userId,
            role: "OWNER",
        });

        return group;
    });
}

export async function getUserGroups(userId) {
    return await findGroupsByUserId(userId);
}

export async function getGroupDetails({
    groupId,
    userId,
}) {

    const group = await findGroupByIdForUser(
        groupId,
        userId
    );

    if (!group) {
        throw new AppError(
            403,
            "GROUP_ACCESS_DENIED",
            "You are not a member of this group."
        );
    }

    return group;
}


export async function addMemberToGroup({
    groupId,
    requesterId,
    email,
}) {
    const requester = await findGroupMember({
        groupId,
        userId: requesterId,
    });

    if (!requester) {
        throw new AppError(
            403,
            "GROUP_ACCESS_DENIED",
            "You are not a member of this group."
        );
    }

    if (requester.role !== "OWNER") {
        throw new AppError(
            403,
            "INSUFFICIENT_GROUP_ROLE",
            "Only the group owner can add members."
        );
    }

    const user = await findUserByEmail(email);

    if (!user) {
        throw new AppError(
            404,
            "USER_NOT_FOUND",
            "No user exists with this email."
        );
    }

    const existingMember = await findGroupMember({
        groupId,
        userId: user.id,
    });

    if (existingMember) {
        throw new AppError(
            409,
            "USER_ALREADY_MEMBER",
            "User is already a member of this group."
        );
    }

    return await addGroupMember(pool, {
        groupId,
        userId: user.id,
        role: "MEMBER",
    });
}


export async function getGroupMembers({
    groupId,
    requesterId,
}) {
    const requester = await findGroupMember({
        groupId,
        userId: requesterId,
    });

    if (!requester) {
        throw new AppError(
            403,
            "GROUP_ACCESS_DENIED",
            "You are not a member of this group."
        );
    }

    return await findGroupMembers(groupId);
}

export async function removeMemberFromGroup({
    groupId,
    requesterId,
    targetUserId,
}) {
    const requester = await findGroupMember({
        groupId,
        userId: requesterId,
    });

    if (!requester) {
        throw new AppError(
            403,
            "GROUP_ACCESS_DENIED",
            "You are not a member of this group."
        );
    }

    const target = await findGroupMember({
        groupId,
        userId: targetUserId,
    });

    if (!target) {
        throw new AppError(
            404,
            "MEMBER_NOT_FOUND",
            "This user is not a member of the group."
        );
    }

    // Member can only remove themselves.
    if (
        requester.role === "MEMBER" &&
        requesterId !== targetUserId
    ) {
        throw new AppError(
            403,
            "INSUFFICIENT_GROUP_ROLE",
            "Only the group owner can remove other members."
        );
    }

    // Owner cannot remove themselves.
    if (
        requester.role === "OWNER" &&
        requesterId === targetUserId
    ) {
        throw new AppError(
            400,
            "OWNER_CANNOT_LEAVE",
            "The group owner cannot leave the group."
        );
    }

    return await removeGroupMember({
        groupId,
        userId: targetUserId,
    });
}