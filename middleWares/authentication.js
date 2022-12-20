const jwt = require("jsonwebtoken");

exports.authentication = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(409).json({
      success: false,
      message: "A token is required for authorization",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      res.status(403).json({ success: false, message: "Invalid token" });
    } else if (error.name === "TokenExpiredError") {
      res.status(401).json({ success: false, message: "Token expired" });
    } else {
      res.status(400).json({ success: false, message: "Bad request" });
    }
  }
  return next();
};
