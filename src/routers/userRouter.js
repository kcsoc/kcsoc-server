const router = require("express").Router();
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register user
router.post("/register", async (req, res) => {
    console.log(req.body);
    try {
        let { username, university, password, passwordCheck } = req.body;

        // validate
        if (!username || !password || !passwordCheck || !university) {
            return res
                .status(400)
                .json({ msg: "Not all fields have been entered" });
        }
        if (password.length < 7) {
            return res.status(400).json({
                msg: "Password needs to be at least 7 characters long.",
            });
        }
        if (password !== passwordCheck) {
            return res.status(400).json({ msg: "Passwords do not match" });
        }
     
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res
                .status(400)
                .json({ msg: "Account with this username already exists" });
        }

        const newUser = new User({
            username,
            password,
            university,
        });

        const savedUser = await newUser.save();
        console.log(savedUser);
        const userObject = savedUser.toObject();
        delete userObject.password;

        res.status(201).json(userObject);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// Login user
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        // validate
        if (!username || !password) {
            return res
                .status(400)
                .json({ msg: "Not all fields have been entered" });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({
                msg: "Invalid credentials",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

        const userObject = user.toObject();
        delete userObject.password;

        res.json({
            token,
            user: userObject,
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Verify Token
router.post("/tokenIsValid", async (req, res) => {
    try {
        const token = req.header("x-auth-token");
        if (!token) return res.json(false);

        const verified = jwt.verify(token, process.env.JWT_SECRET);
        if (!verified) return res.json(false);

        const user = await User.findById(verified.id);
        if (!user) return res.json(false);

        return res.json(true);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
