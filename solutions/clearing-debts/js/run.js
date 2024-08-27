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

function equilibrium(balance) {}
