const router = require("express").Router();
const auth = require("../middleware/auth");

// Create event
router.post("/create", auth, async (req, res) => {
	try {
		return res.status(201).send({ msg: "Event created" });
	} catch (e) {
		return res.status(500).send({ error: e.message });
	}
});

module.exports = router;
