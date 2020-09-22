const router = require("express").Router();
const contentful = require("contentful-management");
const auth = require("../middleware/auth");
const User = require("../models/userModel");

// Connect to Contentful
async function connect() {
	const client = await contentful.createClient({
		accessToken: "CFPAT-R51rT038dE_Ttb-i512kTQqT84vA3yZhb9dVbTjisPU",
	});

	const space = await client.getSpace("46wxbd41m945");

	return await space.getEnvironment("master");
}

async function getData(env, id) {
	let data = await env.getEntry(id);
	// data.fields.speaker["en-US"] = "Devamrita Maharaj";
	// await data.update();
	// data = await env.getEntry(id);

	// console.log(data);

	// await data.publish();
}

async function createEvent(env, data, user) {
	env.createEntry("event", {
		fields: {
			name: { "en-US": data.name },
			speaker: { "en-US": data.speaker },
			location: { "en-US": data.location },
			university: { "en-US": data.university },
			dateAndTime: { "en-US": data.dateAndTime },
			type: { "en-US": data.type },
		},
	}).then((entry) => {
		entry.publish();
		const eventId = entry.sys.id;
		user.eventsCreated.push(eventId);
		user.save();
	});
}

// Create event
router.post("/create", auth, async (req, res) => {
	try {
		const user = await User.findById(req.user);
		const env = await connect();
		await createEvent(env, req.body, user);
		return res.status(201).send({ msg: "Event created" });
	} catch (e) {
		return res.status(500).send({ error: e.message });
	}
});

module.exports = router;

//CFPAT-R51rT038dE_Ttb-i512kTQqT84vA3yZhb9dVbTjisPU
