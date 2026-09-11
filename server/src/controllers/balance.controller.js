import { getGroupBalances, getSimplifiedDebts } from "../services/balance.service.js";

export async function getBalances(req, res, next) {
  try {
    const balances = await getGroupBalances({
      groupId: req.params.groupId,
      requesterId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      data: { balances },
    });
  } catch (error) {
    next(error);
  }
}

export async function getDebts(req, res, next) {
  try {
    const debts = await getSimplifiedDebts({
      groupId: req.params.groupId,
      requesterId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      data: { debts },
    });
  } catch (error) {
    next(error);
  }
}