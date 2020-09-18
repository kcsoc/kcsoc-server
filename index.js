const express = require("express");
const cors = require("cors");

// Set up environment variables
require("dotenv").config();

// Set up express
const app = express();
app.use(cors());
app.use(express.json());

// Set up routers
app.use("/events", require("./src/routers/eventRouter"));
app.use("/users", require("./src/routers/userRouter"));

// Set up mongoose
mongoose
    .connect(
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
    )
    .then(() => console.log("connected to MongoDB succeeded"))
    .catch(() => console.log("connection to MongoDB failed!"));


// Start up the server
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server listening on port ${port}.`));
