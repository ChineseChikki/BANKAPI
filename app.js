const express = require("express");
const app = express();
require("dotenv").config();

//DATABASE FOR CONNECTION
const mongoose = require("mongoose");

// ROUTING CONNECTION
const userRoute = require("./routes/auth");
const accountRoute = require("./routes/account");

//MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CONNECT THE MONGO DB ONLINE
mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGODB_URL, () => {
  console.log("Connected to MongoDB");
});

//imports all routes from routes folder
app.use("/api/auth", userRoute);
app.use("/api/account", accountRoute);

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Server running at port ${port}`));
