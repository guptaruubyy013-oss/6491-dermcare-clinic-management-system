const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect route
const protect = async (req, res, next) => {
  let token;

  // Check Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "dermcare_jwt_secret_key_2026"
      );

      // Find logged-in user
      req.user = await User.findById(decoded.id).select("-password");

      // If user no longer exists
      if (!req.user) {
        return res.status(401).json({
          message: "Not authorized, user not found",
        });
      }

      next();
    } catch (error) {
      console.error("JWT Authentication Error:", error.message);

      return res.status(401).json({
        message: "Not authorized, token invalid",
      });
    }
  } else {
    return res.status(401).json({
      message: "Not authorized, no token provided",
    });
  }
};

// Authorize roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied. You do not have permission.",
      });
    }

    next();
  };
};

module.exports = {
  protect,
  authorize,
};