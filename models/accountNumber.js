const mongoose = require("mongoose");

const accountNumberSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: true,
    unique: true,
  },

  account: {
    type: mongoose.Types.ObjectId,
    ref: "account",
  },
});
const accountNumberModel = mongoose.model("accountNumber", accountNumberSchema);
module.exports = accountNumberModel;
