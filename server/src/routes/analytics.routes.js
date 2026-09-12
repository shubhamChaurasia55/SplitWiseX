import express from "express";

import {
    getAnalytics,
} from "../controllers/analytics.controller.js";

import {
    requireAuth,
} from "../middleware/auth.middleware.js";


const router = express.Router();


router.get(
    "/:groupId/analytics",
    requireAuth,
    getAnalytics
);


export default router;