const mongoose = require("mongoose");

const AccountType = {
  SAVINGS: "SAVINGS",
  CURRENT: "CURRENT",
};

const accountSchema = new mongoose.Schema(
  {
    number: {
      type: Number,
      unique: true,
    },

    balance: {
      type: Number,
      default: 0,
    },

    pin: {
      type: Number,
      default: null,
    },

    owner: {
      type: mongoose.Types.ObjectId,
      ref: "user",
    },

    transactions: [
      {
        type: mongoose.Types.ObjectId,
        ref: "transactionHistory",
      },
    ],

    accountType: {
      type: String,
      enum: [AccountType.SAVINGS, AccountType.CURRENT],
      default: AccountType.SAVINGS,
    },
  },
  {
    timestamps: true,
  }
);

const accountModel = mongoose.model("account", accountSchema);
module.exports = accountModel;
