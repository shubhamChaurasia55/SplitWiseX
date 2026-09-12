import {
    getGroupAnalytics,
} from "../services/analytics.service.js";


export async function getAnalytics(
    req,
    res,
    next
) {
    try {
        const analytics =
            await getGroupAnalytics({
                groupId:
                    req.params.groupId,

                requesterId:
                    req.user.id,
            });

        return res.status(200).json({
            success: true,
            data: analytics,
        });
    } catch (error) {
        next(error);
    }
}