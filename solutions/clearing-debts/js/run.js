const fs = require("fs");
const path = require("path");

const data = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../../../exercises/clearing-debts/data.json"))
);

function initBalance(data) {
  const balanceEntries = data.participants.map((participant) => [participant.id, 0]);
  return Object.fromEntries(balanceEntries);
}

function processTransaction(transaction, balance) {
  const payerId = transaction.payerId;
  const breakdown = transaction.breakdown.filter((b) => b.participantId !== payerId);
  for (const payment of breakdown) {
    const participant = payment.participantId;
    balance[payerId] = Number((balance[payerId] + payment.amount).toFixed(2));
    balance[participant] = Number((balance[participant] - payment.amount).toFixed(2));
  }
}

function computeBalance(data) {
  const balance = initBalance(data);
  for (const transaction of data.transactions) {
    processTransaction(transaction, balance);
  }
  return balance;
}

console.log(computeBalance(data));

// let test = { 1: -0.29, 2: -111.62, 3: 141.36, 4: -29.45 };
let test = { 1: -98, 2: -2, 3: -50, 4: -1, 5: 52, 6: 35, 7: 34, 8: 30 };
// let test = { 1: -0.29, 2: -111.62, 3: 141.36, 4: -29.45 };

function toTwoDecimals(number) {
  return Number(Number(number).toFixed(2));
}

function sortByAmount(list, order = 1) {
  return list.sort((a, b) => order * (a.amount - b.amount));
}

function separateCreditorsFromDebtors(balance) {
  const balanceEntries = Object.entries(balance);
  const creditors = [];
  const debtors = [];

  for (const [id, amount] of balanceEntries) {
    if (amount > 0) {
      creditors.push({ id, amount });
    } else if (amount < 0) {
      debtors.push({ id, amount });
    }
  }
  return { debtors, creditors };
}

function getMirrorTransaction(creditors, debtors) {
  for (let i = 0; i < creditors.length; i++) {
    const creditor = creditors[i];
    const searchAmount = creditor.amount * -1;
    const foundMirroIndex = debtors.findIndex((debtor) => debtor.amount === searchAmount);
    if (foundMirroIndex < 0) {
      continue;
    }
    const debtor = debtors[foundMirroIndex];
    creditors.splice(i, 1);
    debtors.splice(foundMirroIndex, 1);
    return {
      amount: creditor.amount,
      from: debtor.id,
      to: creditor.id,
    };
  }
}

function createOperation(sortedCreditors, sortedDebtors) {
  const debtor = sortedDebtors.shift();
  const firstCreditor = sortedCreditors.shift();
  const amountDifference = toTwoDecimals(debtor.amount + firstCreditor.amount);
  const operation = {
    amount: 0,
    from: debtor.id,
    to: firstCreditor.id,
  };
  if (amountDifference < 0) {
    operation.amount = firstCreditor.amount;

    sortedDebtors.unshift({ id: debtor.id, amount: amountDifference });
  } else {
    operation.amount = Math.abs(debtor.amount);

    sortedCreditors.push({ id: firstCreditor.id, amount: amountDifference });
  }
  return operation;
}

function strategySmallDebtsFirst(creditors, debtors, transactions = []) {
  if (creditors.length === 0 || debtors.length === 0) {
    return transactions;
  }
  const mirror = getMirrorTransaction(creditors, debtors);
  if (mirror) {
    transactions.push(mirror);
    return strategySmallDebtsFirst(creditors, debtors, transactions);
  }
  const sortedCreditors = sortByAmount(creditors, -1);
  const sortedDebtors = sortByAmount(debtors, -1);

  const operation = createOperation(sortedCreditors, sortedDebtors);
  transactions.push(operation);

  return strategySmallDebtsFirst(sortedCreditors, sortedDebtors, transactions);
}

function strategyLargeDebtsFirst(creditors, debtors, transactions = []) {
  if (creditors.length === 0 || debtors.length === 0) {
    return transactions;
  }
  const mirror = getMirrorTransaction(creditors, debtors);
  if (mirror) {
    transactions.push(mirror);
    return strategyLargeDebtsFirst(creditors, debtors, transactions);
  }
  const sortedCreditors = sortByAmount(creditors, -1);
  const sortedDebtors = sortByAmount(debtors, 1);

  const operation = createOperation(sortedCreditors, sortedDebtors);
  transactions.push(operation);

  return strategyLargeDebtsFirst(sortedCreditors, sortedDebtors, transactions);
}

function equilibrium(balance) {
  const { creditors, debtors } = separateCreditorsFromDebtors(balance);

  const smallDebtsTransactions = strategySmallDebtsFirst(
    structuredClone(creditors),
    structuredClone(debtors)
  );
  console.log("small", smallDebtsTransactions);
  if (smallDebtsTransactions.length === Math.max(creditors.length, debtors.length)) {
    console.log("only small");
  }

  const largeDebtsTransactions = strategyLargeDebtsFirst(creditors, debtors);
  console.log("large", largeDebtsTransactions);
  if (largeDebtsTransactions.length < smallDebtsTransactions.length) {
    console.log("large chosen");
  } else {
    console.log("small chosen");
  }
}

equilibrium(test);
