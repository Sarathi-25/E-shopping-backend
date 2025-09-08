import User from "../models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ------------------ SIGNUP ------------------
export const signup = async (req, res) => {
  const { firstname, lastname, email, password, phoneNumber, address, role } =
    req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const newUser = new User({
      firstname,
      lastname,
      email,
      password,
      phoneNumber,
      address,
      role: role || "user", // ✅ default role
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role }, // ✅ include role in JWT
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({ token, user: newUser });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ------------------ LOGIN ------------------
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role }, // ✅ include role in JWT
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ------------------ GOOGLE LOGIN ------------------
export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential)
      return res.status(400).json({ message: "No credential provided" });

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    const [firstName, ...lastNameParts] = payload.name.split(" ");
    const lastName = lastNameParts.join(" ") || "";

    let user = await User.findOne({ email: payload.email });

    if (!user) {
      user = await User.create({
        firstname: firstName,
        lastname: lastName,
        fullName: payload.name,
        email: payload.email,
        provider: "google",
        role: "user", // ✅ assign default role for Google users
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role }, // ✅ include role in JWT
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user });
  } catch (err) {
    console.error("Google login error:", err);
    res.status(400).json({ message: "Google login failed" });
  }
};

// ------------------ GET PROFILE ------------------
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ------------------ UPDATE PROFILE ------------------
export const updateProfile = async (req, res) => {
  try {
    const updates = [
      "firstname",
      "lastname",
      "phoneNumber",
      "address",
      "image",
    ].reduce((acc, field) => {
      if (req.body[field] !== undefined) acc[field] = req.body[field];
      return acc;
    }, {});

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
    }).select("-password");

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    res.json(updatedUser);
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: err.message });
  }
};


// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // exclude password
    res.json(users);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email, phoneNumber, newPassword } = req.body;

    const user = await User.findOne({ email, phoneNumber });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Invalid email or phone number." });
    }

    user.password = newPassword; // bcrypt hash here in real case
    await user.save();

    res.json({ message: "Password reset successful." });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};