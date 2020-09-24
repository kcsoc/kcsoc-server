const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// Set up environment variables
require("dotenv").config();

// Set up express
const app = express();
app.use(cors());
app.use(express.json());

// Set up a basic homepage
app.get("/", (req, res) => {
	res.send("Welcome to the KCSOC Server API");
});

// Set up routers
app.use("/events", require("./src/routers/eventRouter"));
app.use("/users", require("./src/routers/userRouter"));
app.use("/forms", require("./src/routers/formRouter"));

// Set up mongoose
mongoose.connect(
	process.env.MONGODB_URI,
	{
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
	},
	(err) => {
		if (err) throw err;
		console.log("MongoDB connection established");
	}
);

// Start up the server
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server listening on port ${port}.`));
