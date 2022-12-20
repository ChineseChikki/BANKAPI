const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },

    lastName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    otp: {
      type: Number,
    },

    transactionPin: {
      type: Number,
    },

    account: {
      type: mongoose.Types.ObjectId,
      ref: "account",
    },

    isActive: {
      type: Boolean,
      default: false,
    },
  },

  {
    timestamps: true,
  }
);

const userModel = mongoose.model("user", userSchema);
module.exports = userModel;
