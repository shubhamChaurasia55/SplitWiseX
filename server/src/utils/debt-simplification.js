export function simplifyDebts(balances) {
  const creditors = [];
  const debtors = [];

  // 1. Split people into who's owed money (creditors) and who owes money (debtors)
  for (const balance of balances) {
    if (balance.netBalancePaise > 0) {
      creditors.push({
        userId: balance.userId,
        name: balance.name,
        amountPaise: balance.netBalancePaise,
      });
    } else if (balance.netBalancePaise < 0) {
      debtors.push({
        userId: balance.userId,
        name: balance.name,
        amountPaise: Math.abs(balance.netBalancePaise),
      });
    }
  }

  // 2. Greedily match debtors against creditors until everyone is settled
  const debts = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];

    const amountPaise = Math.min(debtor.amountPaise, creditor.amountPaise);

    debts.push({
      from: { userId: debtor.userId, name: debtor.name },
      to: { userId: creditor.userId, name: creditor.name },
      amountPaise,
      amount: amountPaise / 100,
    });

    debtor.amountPaise -= amountPaise;
    creditor.amountPaise -= amountPaise;

    if (debtor.amountPaise === 0) debtorIndex++;
    if (creditor.amountPaise === 0) creditorIndex++;
  }

  return debts;
}