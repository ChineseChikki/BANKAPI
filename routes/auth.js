const route = require("express").Router();

const {
  register,
  verifyAccount,
  login,
  forgotPassword,
  resetPassword,
  getUserById,
} = require("../controllers/auth");

const {
  registerValidation,
  verifyEmailValidation,
  loginValidation,
  validateEmail,
} = require("../middleWares/authValidation");

route.post("/register", registerValidation, register);
route.post("/verify-account", verifyEmailValidation, verifyAccount);
route.post("/login", loginValidation, login);
route.post("/forgot-password", validateEmail, forgotPassword);
route.post("/reset-password", resetPassword);
route.get("/user/:user_id", getUserById);

module.exports = route;
