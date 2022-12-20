const route = require("express").Router();
const { authentication } = require("../middleWares/authentication");

const {
  createAccount,
  deposit,
  withdrawal,
  transfer,
  getBalance,
  getHistory,
} = require("../controllers/account");

const {
  createAccountValidation,
  depositValidation,
  withdrawalValidation,
  transferValidation,
} = require("../middleWares/accountValidation");

route.post(
  "/create-account",
  [authentication, createAccountValidation],
  createAccount
);

route.post("/deposit/:accountId", [authentication, depositValidation], deposit);

route.post(
  "/withdraw/:accountId",
  [authentication, withdrawalValidation],
  withdrawal
);

route.post(
  "/transfer/:accountId",
  [authentication, transferValidation],
  transfer
);

route.get("/balance/:accountId", authentication, getBalance);

route.get("/history/:accountId", authentication, getHistory);

module.exports = route;
