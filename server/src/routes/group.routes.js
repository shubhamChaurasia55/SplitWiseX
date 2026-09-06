import express from "express";

import { requireAuth } from "../middleware/auth.middleware.js";

import { addMember, createGroup, getGroup, getGroups, getMembers, removeMember } from "../controllers/group.controller.js";

const router = express.Router();

router.post(
    "/",
    requireAuth,
    createGroup
);

router.get(
    "/",
    requireAuth,
    getGroups
);

router.get(
    "/:groupId",
    requireAuth,
    getGroup
);

router.post(
    "/:groupId/members",
    requireAuth,
    addMember
);

router.get(
    "/:groupId/members",
    requireAuth,
    getMembers
);

router.delete(
    "/:groupId/members/:userId",
    requireAuth,
    removeMember
);

export default router;