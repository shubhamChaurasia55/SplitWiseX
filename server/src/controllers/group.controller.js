import { 
    addMemberToGroup, 
    createNewGroup, 
    getGroupDetails, 
    getGroupMembers, 
    getUserGroups, 
    removeMemberFromGroup 
} from "../services/group.service.js";

export async function createGroup(req, res, next) {

    try {

        const group = await createNewGroup({
            name: req.body.name,
            userId: req.user.id,
        });

        return res.status(201).json({
            success: true,
            data: {
                group,
            },
        });

    } catch (error) {
        next(error);
    }
}

export async function getGroups(req, res, next) {

    try {

        const groups = await getUserGroups(req.user.id);

        return res.status(200).json({
            success: true,
            data: {
                groups,
            },
        });

    } catch (error) {
        next(error);
    }
}


export async function getGroup(req, res, next) {

    try {

        const group = await getGroupDetails({
            groupId: req.params.groupId,
            userId: req.user.id,
        });

        return res.status(200).json({
            success: true,
            data: {
                group,
            },
        });

    } catch (error) {
        next(error);
    }
}

export async function addMember(req, res, next) {

    try {

        const member = await addMemberToGroup({
            groupId: req.params.groupId,
            requesterId: req.user.id,
            email: req.body.email,
        });

        return res.status(201).json({
            success: true,
            data: {
                member,
            },
        });

    } catch (error) {
        next(error);
    }
}


export async function getMembers(req, res, next) {

    try {

        const members = await getGroupMembers({
            groupId: req.params.groupId,
            requesterId: req.user.id,
        });

        return res.status(200).json({
            success: true,
            data: {
                members,
            },
        });

    } catch (error) {
        next(error);
    }
}


export async function removeMember(req, res, next) {

    try {

        const membership = await removeMemberFromGroup({
            groupId: req.params.groupId,
            requesterId: req.user.id,
            targetUserId: req.params.userId,
        });

        return res.status(200).json({
            success: true,
            data: {
                membership,
            },
        });

    } catch (error) {
        next(error);
    }
}