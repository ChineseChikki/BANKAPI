const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const userModel = require("../models/user");
require("dotenv").config();
const { sendMail } = require("../utils/utils");

exports.register = async function (req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstName, lastName, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res
      .status(400)
      .json({ success: false, message: "Passwords do not match" });
  }

  const salt = await bcrypt.genSalt(10);
  const encryptedPassword = await bcrypt.hash(password, salt);

  //generate OTP

  const otp = Math.floor(1000 + Math.random() * 9000);
  console.log(otp);
  const newUser = req.body;
  try {
    const userExist = await userModel.findOne({ email: newUser.email });
    // checks if user exist
    if (userExist) {
      res.status(400).json({ success: false, message: "User already Exist" });
    } else {
      const user = await userModel.create({
        firstName,
        lastName,
        email: email.toLowerCase(),
        password: encryptedPassword,
        otp,
      });
      const subject = "Welcome to the LAST Bank";
      const text = `Hi ${firstName} ${lastName}, welcome to the LAST Bank.\n\nUse this code to verify your account: ${user.otp}`;
      sendMail(String(email), subject, text);

      // res.status(201).json(user);
      res
        .status(201)
        .json({ success: true, message: "user created successfully" });
    }
  } catch (err) {
    res.status(402).json({ success: false, message: "Unable to create" });
  }
};

exports.verifyAccount = async function (req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(401).json({ errors: errors.array() });
  }
  const { email, otp } = req.body;
  let user;
  try {
    user = await userModel.findOne({ email });
  } catch (err) {
    return res.status(500).json({ errors: [{ message: `${err}` }] });
  }
  if (otp !== user.otp) {
    return res.status(422).json({ errors: [{ message: "OTP is incorrect" }] });
  }
  user.isActive = true;
  (user.otp = null), await user.save();
  res.status(200).json({ message: "User verified" });
};

exports.login = async function (req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(401).json({ errors: errors.array() });
  }
  try {
    const { email, password } = req.body;
    if (!(email && password)) {
      res
        .status(400)
        .json({ success: false, message: "All input is required" });
    }
    const user = await userModel.findOne({ email });
    if (
      user === null ||
      (await bcrypt.compare(password, user.password)) === false
    ) {
      res.status(400).json({ success: false, message: "Invalid Credentials" });
    }
    if (user && (await bcrypt.compare(password, user.password))) {
      const payload = {
        id: user.id,
      };
      const token = jwt.sign(payload, process.env.SECRET_KEY, {
        expiresIn: "3d",
      });
      res
        .status(200)
        .json({ success: true, message: "User loggedIn successfully", token });
    }
  } catch (error) {
    res.status(400).json({ success: false, message: error });
  }
};

exports.getUserById = async (req, res) => {
  const id = req.params.user_id;
  try {
    //find the user
    const user = await userModel.findById(id);
    //if found
    if (user) {
      //responds to the client
      res
        .status(200)
        .json({ status: true, msg: "User retrieved successfully", data: user });
    } else {
      //responds to the client
      res.status(404).json({ status: false, msg: "User not Found" });
    }
  } catch (error) {
    console.log(error);
    //responds to the client
    res.status(500).json({ status: false, msg: "Something went wrong" });
  }
};

exports.forgotPassword = async function (req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(401).json({ errors: errors.array() });
  }
  const { email } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(422)
        .json({ errors: [{ message: "User does not exist" }] });
    }
    const otp = Math.floor(1000 + Math.random() * 9000);
    user.otp = otp;
    console.log(otp);
    await user.save();
    //send mail
    const subject = "We Bank - Forgot Password";
    const text = `Hi ${user.firstName} ${user.lastName}, use this otp to reset your password: ${user.otp}`;
    sendMail(String(email), subject, text);
    return res.status(200).json({ success: true, message: "OTP sent" });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(422)
        .json({ errors: [{ message: "User does not exist" }] });
    }
    return res
      .status(500)
      .json({ errors: [{ message: "Internal Server error" }] });
  }
};

exports.resetPassword = async function (req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(401).json({ errors: errors.array() });
  }
  const { email, otp, password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    return res
      .status(422)
      .json({ errors: [{ message: "Passwords do not match" }] });
  }
  let user;
  try {
    user = await userModel.findOne({ email });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(422)
        .json({ errors: [{ message: "User does not exist" }] });
    }
    return res
      .status(500)
      .json({ errors: [{ message: "Internal Server error" }] });
  }
  if (user.otp !== Number(otp)) {
    return res.status(422).json({ errors: [{ message: "OTP is incorrect" }] });
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  user.password = hashedPassword;
  user.otp = null;
  await user.save();
  res.status(200).json({ message: "password successfully changed" });
};
