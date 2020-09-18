const router = require("express").Router();
const User = require("../models/userModel");

// Register user
router.post("/register", async (req, res) => {
	// console.log(req.body);
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
		res.status(201).json(savedUser);
	} catch (e) {
		res.status(400).json({ error: e.message });
	}
});

module.exports = router;
