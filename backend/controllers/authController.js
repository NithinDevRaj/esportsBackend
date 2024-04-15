import asyncHandler from "express-async-handler";
import User from "../model/userModel.js";
import generateToken from "../utils/generatToken.js";
import googleOAuth from "../utils/googleOAuth.js";
import { sendEmail } from "../middlewares/otpValidation.js";
console.log( 'nithin')
// @desc  Auth User/set token
// route  POST  /api/users/login

const loginUser = asyncHandler(async (req, res) => {
  
  const { email, password } = req.body;

  // Input Validation
  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required.");
  }

  // Find the user by email
  const user = await User.findOne({ email });
  
  console.log(user);
  if (user.block) {
    res.status(401).json({ message: "Your account is blocked" });
    throw new Error("You have been blocked");
  }
  if (user && (await user.matchPassword(password))) {
    // Generate and set JWT token
    generateToken(res, user._id);
    // Logging
    console.log(`User logged in: ${user.name}, ${user.email}`);
    user.online = true;
    await user.save();
    res.status(201).json({
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto,
        // ...user,
      },
      message: "Logged in successfully",
    });
  } else {
    res.status(500).json({ success: false, error: "invalid credentials" });
  }
});

// @desc  Register new user
// route  POST /api/users/register

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  console.log("nithin");
  try {
    // Input Validation
    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        error: "Name, email, and password are required.",
      });
      return;
    }

    // Check if user with the same email already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ success: false, error: "User already exists" });
      return;
    }

    // Create a new user
    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      // Generate and set JWT token
      generateToken(res, user._id);

      // Logging
      console.log(`New user registered: ${user.name}, ${user.email}`);
      user.online = true;
      await user.save();
      res.status(201).json({
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profilePhoto: user.profilePhoto,
        },
        message: "Registration successful",
      });
    } else {
      res.status(400);
      throw new Error("invalid user data");
    }
  } catch (error) {
    console.error(error); // Log any unexpected errors
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// @desc  Register and Login user using googleOauth
// route  POST /api/users/google-auth
const googleAuth = asyncHandler(async (req, res) => {
  try {
    const { clientId, credential } = req.body;
    //decoding token
    const response = await googleOAuth(clientId, credential);

    const email = response.email;

    const user = await User.findOne({ email });

    if (user) {
      // Generate and set JWT token
      generateToken(res, user._id);

      // Logging
      console.log(`User logged in: ${user.name}, ${user.email}`);
      user.online = true;
      await user.save();
      res.status(201).json({
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profilePhoto: user.profilePhoto,
        },
        message: `welcome ${user.name}`,
      });
    } else if (!user) {
      // Create a new user
      const newUser = await User.create({
        name: response.name,
        email: response.email,
        password: response.email,
      });
      if (newUser) {
        // Generate and set JWT token
        generateToken(res, newUser._id);

        // Logging
        console.log(`New User registered: ${newUser.name}, ${newUser.email}`);
        newUser.online = true;
        await newUser.save();
        res.status(201).json({
          data: {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            profilePhoto: newUser.profilePhoto,
          },
          message: "your password will be your email address",
        });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
});

// @desc  Senting OTP for registration
// route  POST /api/users/sentOtp
const sentOtpRegister = asyncHandler(async (req, res) => {
  const email = req.body.email;

  // Input Validation
  if (!email) {
    res.status(400);
    throw new Error("Email is required");
  }

  // Generate and send OTP
  const otp = await sendEmail(email, res);
  console.log("sendEmail", otp);
  if (otp) {
    // Send a success response without revealing the OTP
    res.status(200).json({ message: "OTP sent to the email address.", otp });

    // Logging
    console.log(`OTP sent to ${email}`);
  } else {
    res.status(500);
    throw new Error("Failed to send OTP. Please try again later.");
  }
});

//@desc   Sent Otp ForgetPassword
//route   POST /api/users/sentOtpForgetpassword
const sentOtpForgotPasword = asyncHandler(async (req, res) => {
  const email = req.body.email;

  // Input Validation
  if (!email) {
    res.status(400);
    throw new Error("Email is required.");
  }

  // Find the user by email
  const user = await User.findOne({ email });

  if (user) {
    // Generate and send OTP
    const otp = await sendEmail(email, res);
    // Logging
    console.log(`OTP sent for password reset to ${email}: ${otp}`);

    return res.status(200).json({
      otp,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto,
      },
      message: `OTP sent for password reset to ${email}: ${otp}`,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

//@desc   Change password
//route   PATCH  /api/users/updatePassword
const changePassword = asyncHandler(async (req, res) => {
  console.log(req.body);
  const { email } = req.body;
  console.log(email);
  // Input Validation
  if (!email || !req.body.password) {
    res.status(400);
    throw new Error("Email and password are required.");
  }

  // Find the user by email
  const user = await User.findOne({ email });

  if (user) {
    // Update the user's password
    user.password = req.body.password;
    await user.save();

    // Logging
    console.log(`Password changed for user: ${user.name}, ${user.email}`);

    const message = `Password changed for user: ${user.name}, ${user.email}`;
    res.status(200).json({
      data: {
        id: user._id,
        name: user.userName,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto,
      },
      message,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc  Logout user and clear cookie
// route  POST /api/users/logout
const logoutUser = asyncHandler(async (req, res) => {
  const { id } = req.body;
  console.log(id);
  const user = await User.findOne({ _id: id });
  // Input Validation
  if (!res.cookie) {
    res.status(400);
    throw new Error("No JWT cookie found.");
  }

  // Clear the JWT cookie
  res.clearCookie("jwt", {
    httpOnly: true,
    expires: new Date(0),
  });
  user.online = false;
  await user.save();
  // Logging
  console.log("User logged out");

  res.status(200).json({ message: "User logged out" });
});
export {
  loginUser,
  registerUser,
  logoutUser,
  sentOtpForgotPasword,
  sentOtpRegister,
  changePassword,
  googleAuth,
};
