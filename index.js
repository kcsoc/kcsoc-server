const express = require("express");
const cors = require("cors");

// set up express
const app = express();
app.use(cors());
app.use(express.json());

// set up router
app.use(require("./src/routers/eventRouter"));

// start up the server
const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`Server listening on port ${port}.`));
