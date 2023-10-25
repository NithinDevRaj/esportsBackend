import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../model/userModel.js";

// Middleware to protect routes by checking for a valid JWT token
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check if the JWT token exists in cookies
  token = req.cookies.jwt;

  if (token) {
    try {
      // Verify and decode the token using the JWT_SECRET stored in environment variables
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user associated with the token's userId
      // Exclude the password field from the user object for security
      req.user = await User.findById(decoded.userId).select("-password");

      // Continue to the next middleware or route handler
      next();
    } catch (error) {
      // If the token is invalid or expired, send a 401 Unauthorized response
      res.status(401);
      throw new Error("Not authorized, invalid token");
    }
  } else {
    // If there is no token, send a 401 Unauthorized response
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

export { protect };
