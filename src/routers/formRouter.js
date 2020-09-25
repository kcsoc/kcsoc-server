const router = require("express").Router();
const moment = require("moment");
const { google } = require("googleapis");
require("dotenv").config();

const client = new google.auth.JWT(
    process.env.GOOGLE_KEYS_CLIENT_EMAIL,
    null,
    process.env.GOOGLE_KEYS_PRIVATE_KEY,
    ["https://www.googleapis.com/auth/spreadsheets"]
);

client.authorize(function (err) {
    if (err) {
        console.log(err);
        return;
    }

    console.log("Connected to Google Sheets!");
});

const gsapi = google.sheets({ version: "v4", auth: client });

router.post("/get-involved", async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            university,
            email,
            phoneNumber,
        } = req.body;

        const newRow = [
            [
                firstName,
                lastName,
                university,
                email,
                phoneNumber,
                moment().format("DD/MM/YYYY"),
            ],
        ];

        const updateOptions = {
            spreadsheetId: "1ywgsA221E8TbulZ0LXAzZMWn0MXP9yCd4JeAsy3vDuc",
            range: "Get Involved!A1",
            valueInputOption: "USER_ENTERED",
            resource: {
                values: newRow,
            },
        };

        await gsapi.spreadsheets.values.append(updateOptions);
        return res.status(201).send({ msg: "Form submission accepted" });
    } catch (e) {
        return res.status(500).send({ error: e.message });
    }
});

router.post("/set-up-a-kcsoc", async (req, res) => {
    try {
        const { firstName, lastName, email, phoneNumber } = req.body;

        const newRow = [
            [
                firstName,
                lastName,
                email,
                phoneNumber,
                moment().format("DD/MM/YYYY"),
            ],
        ];

        const updateOptions = {
            spreadsheetId: "1ywgsA221E8TbulZ0LXAzZMWn0MXP9yCd4JeAsy3vDuc",
            range: "Set Up A KCSOC!A1",
            valueInputOption: "USER_ENTERED",
            resource: {
                values: newRow,
            },
        };

        await gsapi.spreadsheets.values.append(updateOptions);
        return res.status(201).send({ msg: "Form submission accepted" });
    } catch (e) {
        return res.status(500).send({ error: e.message });
    }
});

module.exports = router;
