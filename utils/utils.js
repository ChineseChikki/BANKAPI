const nodemailer = require("nodemailer");
require("dotenv").config();
const accountNumberModel = require("../models/accountNumber");
const user = process.env.EMAIL;
const pass = process.env.PASSWORD;

exports.sendMail = async function (recipients, subject, text) {
  console.log({ user, pass });
  let transport = nodemailer.createTransport({
    Service: "gmail",
    auth: {
      user: user,
      pass: pass,
    },
    port: 465,
    host: "smtp.gmail.com",
    secure: true,
  });

  let mailOptions = {
    from: '"LAST Bank" <chinenyeozoagudike@gmail.com>',
    to: recipients,
    subject: subject,
    text: text,
    html: `<b> ${text}<b>`,
  };

  transport.sendMail(mailOptions, (err) => {
    if (err) {
      console.log("error occurs", err);
    } else {
      console.log("email sent");
    }
  });
};

exports.generateAccountNumber = async function () {
  let accountNumber = "33";
  for (let i = 0; i < 8; i++) {
    accountNumber += Math.floor(Math.random() * 10);
  }

  const accountNumberFound = await accountNumberModel.findOne({
    number: Number(accountNumber),
  });
  while (accountNumberFound) {
    generateAccountNumber();
  }
  const newAccountNumber = new accountNumberModel({
    number: Number(accountNumber),
  });
  await newAccountNumber.save();
  return Number(accountNumber);
};
