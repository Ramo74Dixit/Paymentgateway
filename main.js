const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
// Initialize Express
const app = express();
const PORT = 5000;
const jwtSecret = "your_secret_key";
app.use(bodyParser.json()); 
 
mongoose
    .connect("mongodb://127.0.0.1:27017/bcrypt-hasing", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));
 
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    token: { type: String },
    otp: { type: String },
    otpExpires: { type: String },
});
const User = mongoose.model("User", userSchema);
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "ramodixit577@gmail.com",
        pass: "tgov igip gsjz ffeh",
    },
});

const generateOTP = () => crypto.randomInt(100000, 999999).toString();
const sendWelcomeMail = async (email, username, otp) => {
    try {
        await transporter.sendMail({
            from: "ramodixit577@gmail.com",
            to: email,
            subject: "Welcome to our Company Kodu!!",
            text: `Hi ${username}, Thank You for Joining and registering in our company. Your OTP is
${otp}. Kindly don't share it.`,
        });
        console.log("Mail Sent Successfully");
    } catch (error) {
        console.error("Error sending mail", error);
    }
};
// Middlewares
const requestLogger = (req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
};
const errorHandler = (err, req, res, next) => {
    console.error("Error:", err.message || err);
    res
        .status(err.status || 500)
        .json({ error: err.message || "Internal Server Error" });
};
const authenticateToken = (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) {   
        return res.status(403).json({ error: "Token required" });
    }
    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) {
            return res.status(401).json({ error: "Invalid token" });
        }
        req.user = user;
        next();
    });
};
const checkOtpExpiry = async (req, res, next) => {
    const { username } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    if (user.otpExpires < Date.now()) {
        return res.status(400).json({ error: "OTP has expired" });
    }
    req.user = user;
    next();
};
// Apply global middleware
app.use(requestLogger);
// Routes
app.post("/signup", async (req, res, next) => {
    const { username, password, email } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const token = jwt.sign({ userId: username }, jwtSecret, {
            expiresIn: "24h",
        });
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 3600000);
        const user = new User({
            username,
            password: hashedPassword,
            email,
            token,
            otp,
            otpExpires,
        });
        await user.save();
        await sendWelcomeMail(email, username, otp);
        res.status(200).json({ message: "Signup successful" });
    } catch (error) {
        next(error);
    }
});
app.post("/login", async (req, res, next) => {
    const { username, password, token } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: "User not registered" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid password" });
        }
        if (user.token !== token) {
            return res.status(403).json({ error: "Unauthorized token" });
        }
        res.status(200).json({ message: "Login successful" });
    } catch (error) {
        next(error);
    }
});
app.get("/users", async (req, res, next) => {
    try {
        const users = await User.find({}, { password: 0 });
        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
});
app.put("/users/:id", async (req, res, next) => {
    const { id } = req.params;
    const { username, password } = req.body;
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { username, password: hashedPassword },
            { new: true }
        );
        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
        next(error);
    }
});
app.patch("/users/:id", async (req, res, next) => {
    const { id } = req.params;
    const { username, password } = req.body;
    try {
        const updateData = {};
        if (password) {
            const saltRounds = 10;
            updateData.password = await bcrypt.hash(password, saltRounds);
        }
        if (username) {
            updateData.username = username;
        }
        const updatedUser = await User.findByIdAndUpdate(id, updateData, {
            new: true,
        });
        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
        next(error);
    }
});
app.post("/verify-otp", checkOtpExpiry, async (req, res, next) => {
    const { otp } = req.body;
    try {
        if (req.user.otp !== otp) {
            return res.status(400).json({ error: "Invalid OTP" });
        }
        req.user.otp = undefined;
        req.user.otpExpires = undefined;
        await req.user.save();
        res.status(200).json({ message: "OTP verification successful" });
    } catch (error) {
        next(error);
    }
});
// Error Handling Middleware
app.use(errorHandler);
// Start the server
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
