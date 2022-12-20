const mongoose = require("mongoose");

const TransactionType = {
  DEBIT: "DEBIT",
  CREDIT: "CREDIT",
};

const Title = {
  DEPOSIT: "DEPOSIT",
  WITHDRAWAL: "WITHDRAWAL",
  TRANSFER: "TRANSFER",
};

const transactionHistorySchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now,
    },

    description: {
      type: String,
    },

    amount: {
      type: Number,
      required: true,
    },

    title: {
      type: String,
      required: true,
      enum: [Title.DEPOSIT, Title.WITHDRAWAL, Title.TRANSFER],
    },

    transactionType: {
      type: String,
      required: true,
      enum: [TransactionType.CREDIT, TransactionType.DEBIT],
    },

    account: {
      type: mongoose.Types.ObjectId,
      ref: "account",
    },

    beneficiary: {
      type: mongoose.Types.ObjectId,
      ref: "user",
    },

    sender: {
      type: mongoose.Types.ObjectId,
      ref: "user",
    },
  },
  {
    timestamps: true,
  }
);
const transactionHistoryModel = mongoose.model(
  "transactionHistory",
  transactionHistorySchema
);
module.exports = transactionHistoryModel;
