import mongoose from "mongoose";
import User from "../models/usermodel.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const TOKEN_EXPIRY = '24h';
const JWT_SECRET = 'your_jwt_secret_here';

// Register a new user
export async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email'
      });
    }

    const exists = await User.findOne({ email }).lean();
    if (exists) {
      return res.status(409).json({
        success: false,
        message: 'User already exists'
      });
    }

    const newid = new mongoose.Types.ObjectId();
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      _id: newid,
      name,
      email,
      password: hashedPassword
    });
    await user.save();

    if (!JWT_SECRET) throw new Error('JWT_SECRET is not defined');

    const token = jwt.sign(
      { id: newid.toString() },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY } // ✅ Correct variable
    );

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: { id: user._id.toString(), name: user.name, email: user.email }
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}

// Login a user
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = jwt.sign(
      { id: user._id.toString() },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY } // ✅ Correct variable
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user._id.toString(), name: user.name, email: user.email }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
