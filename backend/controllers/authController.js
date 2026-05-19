const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        });
};

// Register User
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            },
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Login User
const loginUser = async (req, res) => {
    try{
        const {email, password} = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        // Check password
        const isPasswordMatch  = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch ) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        res.status(200).json({
            message: "Login successful",
            user:{
                id: user._id,
                name: user.name,
                email: user.email
            },
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
  registerUser,
  loginUser,
};


/*
What is a Controller?
A controller is a component in the MVC (Model-View-Controller) pattern that handles the incoming requests from the client, processes them (often by interacting with the model), and returns an appropriate response.
-> Routes only decide which controller function to call based on the URL and HTTP method, while controllers contain the actual logic for handling the request.
In this file, we have two main functions: registerUser and loginUser. These functions handle the logic for user registration and login, respectively. They interact with the User model to create new users and validate existing users, and they use bcrypt for password hashing and jwt for token generation.
*/

/*
===============================================
Authentication Flow
===============================================
Register/Login Request
↓
Controller receives data
↓
Check user
↓
Hash/compare password
↓
Generate JWT
↓
Send response
*/

/*
================================================
API Flow
================================================
server.js → routes file → controller function → model/database → response

Frontend sends POST request
↓
POST /api/auth/register
↓
server.js sends it to authRoutes.js
↓
authRoutes.js calls registerUser
↓
registerUser uses User model
↓
MongoDB saves data
↓
Backend sends JSON response

*/