const router = require("express").Router();
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken')

// Register user
router.post("/register", async (req, res) => {
	console.log(req.body);
	try {
		let { email, password, passwordCheck, firstName, lastName } = req.body;

		firstName = firstName.trim();
		lastName = lastName.trim();

		// validate
		if (!email || !password || !passwordCheck || !firstName || !lastName) {
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

		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res
				.status(400)
				.json({ msg: "Account with this email already exists" });
		}

		const newUser = new User({
			firstName,
			lastName,
			email,
			password,
		});

		const savedUser = await newUser.save();
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
		const { email, password } = req.body;

		// validate
		if (!email || !password) {
			return res
				.status(400)
				.json({ msg: "Not all fields have been entered" });
		}

		const user = await User.findOne({ email });
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


module.exports = router;
