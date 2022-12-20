const { validationResult } = require("express-validator");
const accountModel = require("../models/account");
const userModel = require("../models/user");
const TransactionHistoryModel = require("../models/transactionHistory");
const { generateAccountNumber } = require("../utils/utils");

exports.createAccount = async function (req, res) {
  // validationResult function checks whether
  // any occurs or not and return an object
  const errors = validationResult(req);

  // If some error occurs, then this
  // block of code will run
  if (!errors.isEmpty()) {
    return res.status(401).json({ errors: errors.array() });
  }
  const { id } = req.user;
  console.log(id);
  let user;
  try {
    user = await userModel.findById(id);
    if (user.account) {
      return res
        .status(400)
        .json({ success: false, message: "you already have an account" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server error" });
  }
  //create bank account
  const { accountType, pin, confirmPin } = req.body;
  if (pin !== confirmPin) {
    return res
      .status(400)
      .json({ success: false, message: "Pin do not match" });
  }
  const account = new accountModel({
    owner: id,
    accountType,
    pin,
    number: await generateAccountNumber(),
  });
  try {
    await account.save();
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Invalid server error" });
  }
  user.account = account._id;
  await user.save();
  res.status(201).json({ account });
};

exports.deposit = async function (req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.user;
  const { accountId } = req.params;
  const { amount, description, transactionType } = req.body;

  let account;
  try {
    account = await accountModel.findById(accountId);
  } catch (err) {
    if (err.message.includes("Cast to ObjectId failed for value")) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Account id" });
    }
    return res.status(500).json({ success: false, message: "Server Error" });
  }

  if (!account) {
    return res
      .status(400)
      .json({ success: false, message: "Bank Account not found" });
  }

  if (account.owner.toString() !== id) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  // create transaction history

  const transaction = new TransactionHistoryModel({
    title: "DEPOSIT",
    transactionType,
    amount,
    description,
    account: accountId,
  });

  try {
    await transaction.save();
  } catch (err) {
    console.log(err.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server error" });
  }

  account.balance += amount;
  account.transactions.push(transaction._id);
  await account.save();
  res.status(200).json({ account });
};

exports.withdrawal = async function (req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.user;
  const { accountId } = req.params;
  const { amount, description, pin, transactionType } = req.body;

  let account;
  try {
    account = await accountModel.findById(accountId);
  } catch (error) {
    if (error.message.includes("Cast to ObjectId failed for value")) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Account Id" });
    }
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
  if (!account) {
    return res
      .status(400)
      .json({ success: false, message: "Bank Account not found" });
  }

  if (account.owner.toString() !== id) {
    return res.status(409).json({ success: false, message: "Invalid pin" });
  }

  if (account.pin !== pin) {
    return res.status(400).json({ success: false, message: "Invalid pin" });
  }

  account.balance -= amount;
  // create transaction history

  const transaction = new TransactionHistoryModel({
    title: "WITHDRAWAL",
    transactionType,
    amount,
    description,
    account: accountId,
  });

  try {
    await transaction.save();
    account.transactions.push(transaction._id);
    await account.save();
    res.status(200).json({ success: true, message: "Withdrawal Successful" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }

  account.balance += amount;
  account.transactions.push(transaction._id);
  await account.save();
};

exports.transfer = async function (req, res) {
  const errors = validationResult(req);
  console.log(errors.isEmpty(), req.body);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.user;
  const { accountId } = req.params;
  const { amount, description, accountNumber, transactionType } = req.body;
  let account;
  try {
    account = await accountModel.findById(accountId);
  } catch (error) {
    if (error.message.includes("Cast to ObjectId failed for value")) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Account Id" });
    }
  }

  if (!account) {
    return res
      .status(400)
      .json({ success: false, message: "Account not found" });
  }
  if (account.owner.toString() !== id) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  let recipientAccount;
  try {
    recipientAccount = await accountModel.findOne({
      number: accountNumber,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }

  if (!recipientAccount) {
    return res
      .status(400)
      .json({ success: false, message: "Account Number does not exist" });
  }

  account.balance -= amount;
  recipientAccount.balance += amount;

  // create transaction history
  const senderTransaction = new TransactionHistoryModel({
    title: "TRANSFER",
    transactionType,
    amount,
    description,
    account: accountId,
  });

  const recipientTransaction = new TransactionHistoryModel({
    title: "TRANSFER",
    transactionType,
    amount,
    description,
    account: recipientAccount._id,
  });

  try {
    recipientAccount.transactions.push(recipientTransaction._id);
    await senderTransaction.save();
    await recipientTransaction.save();

    await account.save();
    await recipientAccount.save();
    return res
      .status(200)
      .json({ success: true, message: "Transfer successful" });
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// Gets the balance of each transaction
exports.getBalance = async function (req, res) {
  const { id } = req.user;
  const { accountId } = req.params;

  // check if user has an account
  let account;
  try {
    account = await accountModel.findById(accountId);
  } catch (error) {
    if (error.message.includes("Cast to ObjectId failed for value")) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid account ID" });
    }
    return res
      .status(500)
      .json({ success: false, message: "internal server error" });
  }
  if (!account) {
    return res
      .status(404)
      .json({ success: false, message: "Bank Account not found" });
  }

  // check if user owns the account
  if (account.owner.toString() !== id) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  res.status(200).json({ balance: account.balance });
};

/**
 * @desc retrieves transaction history for the authenticated user
 */
exports.getHistory = async function (req, res) {
  const { id } = req.user;
  const { accountId } = req.params;

  // check if user has an account
  let account;
  try {
    account = await accountModel.findById(accountId);
  } catch (error) {
    if (error.message.includes("Cast to ObjectId failed for value")) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid account ID" });
    }
    return res
      .status(500)
      .json({ success: false, message: " Internal server error" });
  }
  if (!account) {
    return res
      .status(404)
      .json({ success: false, message: "Bank Account not found" });
  }
  // check if user owns the account
  if (account.owner.toString() !== id) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  const transactions = await TransactionHistoryModel.find({
    account: accountId,
  });
  res.status(200).json({ transactions });
};

//   const errors = validationResult(req);
//   console.log(errors.isEmpty(), req.body);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }
//   const { id } = req.user;
//   console.log(id);
//   const { accountId } = req.params;
//   try {
//     const { accountNumber, amount, description } = req.body;
//     if (!(accountNumber && amount && description)) {
//       res.status(400).send("All input are required");
//     }

//     let beneficiary = await accountModel.findOne({ accountNumber });
//     if (beneficiary === null) {
//       res.status(400).send("User with this account number does not exist");
//     }

//     let currentUser = await accountModel.findById(accountId);
//     if (amount > currentUser.balance && amount > 0) {
//       res.status(400).send("Insufficient funds to make this transfer");
//     }
//     if (currentUser.accountNumber === beneficiary) {
//       res.status(400).send("Sorry you cannot send money to yourself");
//     }

//     if (currentUser.accountNumber !== beneficiary) {
//       beneficiary.balance = beneficiary.balance + amount;
//       currentUser.balance = currentUser.balance - amount;
//       let transactionDetails = await new TransactionHistoryModel({
//         transactionType: "Transfer",
//         accountNumber: accountNumber,
//         description: description,
//         sender: currentUser.accountNumber,
//         transactionAmount: amount,
//       });
//       await beneficiary.save();
//       await currentUser.save();
//       await new TransactionHistoryModel.create(transactionDetails);

//       res
//         .status(200)
//         .send(`Transfer of ${amount} to ${accountNumber} was successful`);
//     }
//   } catch (err) {
//     res.json({ message: err });
//   }
// };
