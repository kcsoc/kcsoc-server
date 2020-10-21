const router = require("express").Router();
const fs = require("fs");
const contentful = require("contentful-management");
const auth = require("../middleware/auth");
const User = require("../models/userModel");
const filePath = "/Users/joshguha/Downloads/download.jpeg";
const fileName = "gecko";
const contentType = "image/jpeg";

// Connect to Contentful
async function connect() {
    const client = await contentful.createClient({
        accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
    });
    const space = await client.getSpace("46wxbd41m945");
    return await space.getEnvironment("master");
}
console.log(fs.readFileSync(filePath));

async function createEvent(env, data, user, asset) {
	console.log("uploading...");
	env.createUpload({
		file: fs.readFileSync(filePath),
		contentType,
		fileName,
	})
		.then((upload) => {
			console.log("creating asset...");
			return env
				.createAsset({
					fields: {
						title: {
							"en-US": fileName,
						},
						file: {
							"en-US": {
								fileName: fileName,
								contentType: contentType,
								uploadFrom: {
									sys: {
										type: "Link",
										linkType: "Upload",
										id: upload.sys.id,
									},
								},
							},
						},
					},
				})
				.then(() => {
					console.log("processing...");
					return asset.processForLocale("en-US", {
						processingCheckWait: 2000,
					});
				})
				.then(() => {
					console.log("publishing...");
					return asset.publish();
				})
				.then(() => {
					console.log("creating event...");
					env.createEntry("event", {
						fields: {
							name: { "en-US": data.name },
							speaker: { "en-US": data.speaker },
							location: { "en-US": data.location },
							university: { "en-US": data.university },
							dateAndTime: { "en-US": data.dateAndTime },
							type: { "en-US": data.type },
							instagramUrl: { "en-US": data.instagramUrl },
							facebookUrl: { "en-US": data.facebookUrl },
							zoomUrl: { "en-US": data.zoomUrl },
							poster: {
								"en-US": {
									sys: {
										id: asset.sys.id,
										linkType: "Asset",
										type: "Link",
									},
								},
							},
						},
					})
						.then((entry) => {
							console.log("publishing event...");
							entry.publish();
							const eventId = entry.sys.id;
							user.eventsCreated.push(eventId);
							user.save();
						})
						.then(() => {
							console.log("done!");
						});
				});
		})
		.catch((err) => {
			console.log(err);
		});
}

// Create event
router.post("/create", auth, async (req, res) => {
    try {
        const env = await connect();
        const user = await User.findById(req.user);
        await createEvent(env, req.body, user);
        return res.status(201).send({ msg: "Event created" });
    } catch (e) {
        return res.status(500).send({ error: e.message });
    }
});

// Get all events created by user
router.get("/getUserEvents", auth, async (req, res) => {
    try {
        const env = await connect();
        const user = await User.findById(req.user);
        const eventsData = await Promise.all(
            user.eventsCreated.map(async id => {
                const data = await env.getEntry(id);
                return data;
            })
        );
        return res.status(200).send(eventsData);
    } catch (e) {
        return res.status(500).send({ error: e.message });
    }
});

// Edit event
router.post("/edit", auth, async (req, res) => {
    try {
        const env = await connect();
        const user = await User.findById(req.user);
        const { id, fields } = req.body;
        if (!user.eventsCreated.includes(id)) {
            return res.status(401).send({
                msg:
                    "Access Denied: Authenticated user has not created this event.",
            });
        }
        const data = await env.getEntry(id);
        data.fields = fields;
        await data.update().then(entry => {
            console.log(entry);
            entry.publish();
        });

        return res.status(201).send({ msg: "Event edited" });
    } catch (e) {
        return res.status(500).send({ error: e.message });
    }
});

// Delete event
router.delete("/delete", auth, async (req, res) => {
    try {
        const env = await connect();
        const user = await User.findById(req.user);
        const { id } = req.body;
        if (!user.eventsCreated.includes(id)) {
            return res.status(401).send({
                msg:
                    "Access Denied: Authenticated user has not created this event or event has already been deleted.",
            });
        }
        env.getEntry(id)
            .then(entry => entry.unpublish())
            .then(entry => {
                entry.delete();
            })
            .then(() => {
                user.eventsCreated = user.eventsCreated.filter(el => el !== id);
                user.save();
            });

        return res.status(201).send({ msg: "Event deleted" });
    } catch (e) {
        return res.status(500).send({ error: e.message });
    }
});

module.exports = router;
