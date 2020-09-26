const router = require("express").Router();
const moment = require("moment");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
require("dotenv").config();

const client = new google.auth.JWT(
    process.env.GOOGLE_KEYS_CLIENT_EMAIL,
    null,
    Buffer.from(process.env.GOOGLE_KEYS_PRIVATE_KEY, "base64").toString(),
    ["https://www.googleapis.com/auth/spreadsheets"]
);

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

transporter.verify(function (error, success) {
    if (error) {
        console.log("Email Server Error: " + error);
    } else {
        console.log("Email Server is ready to take our messages");
    }
});

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

        var mailOptions = {
            from: process.env.SMTP_USER,
            to: process.env.INFO_EMAIL,
            subject: "New kcsoc.com Form Entry: Get Involved",
            text: `
            You have got a new response on the kcsoc.com Get Involved Form!
            Please find further details below.

                Name: ${firstName} ${lastName}
                University: ${university}
                Email: ${email}
                Phone Number: ${phoneNumber}
            `,
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log("Email sent: " + info.response);
            }
        });

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

        var mailOptions = {
            from: process.env.SMTP_USER,
            to: process.env.INFO_EMAIL,
            subject: "New kcsoc.com Form Entry: Set Up a KCSoc",
            text: `
            You have got a new response on the kcsoc.com Get Involved Form!
            Please find further details below.
            
                Name: ${firstName} ${lastName}
                Email: ${email}
                Phone Number: ${phoneNumber}
            `,
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log("Email sent: " + info.response);
            }
        });

        await gsapi.spreadsheets.values.append(updateOptions);
        return res.status(201).send({ msg: "Form submission accepted" });
    } catch (e) {
        return res.status(500).send({ error: e.message });
    }
});

module.exports = router;
