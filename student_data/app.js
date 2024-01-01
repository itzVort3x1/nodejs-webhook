const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const { schoolModel } = require("./models/schoolModel");
const { studentModel } = require("./models/studentModel");
const { default: axios } = require("axios");

const app = express();
const PORT = 3100;
app.use(bodyParser.json());

// IMPORTANT: Add your database url below.
const dbUrl = "";
mongoose.connect(dbUrl);

app.get("/", (req, res) => {
	res.send("Welcome to Student Data Application");
});

app.post("/registerSchool", async (req, res) => {
	let data = req.body;

	const index = await schoolModel.find().count();

	const schoolDetails = new schoolModel({
		schoolName: data.schoolName,
		schoolId: index + 1,
	});

	let schoolData = await schoolDetails.save();

	res.send({
		result: schoolData,
	});
});

app.post("/addWebhookEvent", async (req, res) => {
	let data = req.body;

	let schoolDetails = await schoolModel.findOne({ schoolId: data.schoolId });

	if (schoolDetails) {
		if (schoolDetails.webhookDetails === null) {
			schoolDetails.webhookDetails = [];
		}
		schoolDetails.webhookDetails.push({
			eventName: data.eventName,
			endpointUrl: data.endpointUrl,
		});

		schoolDetails = await schoolModel.findOneAndUpdate(
			{ schoolId: schoolDetails.schoolId },
			schoolDetails,
			{ returnOriginal: false }
		);
	} else {
		console.log("No School");
	}

	res.send({
		result: schoolDetails,
	});
});

app.post("/addStudent", async (req, res) => {
	let data = req.body;

	let studentData;

	let schoolDetails = await schoolModel.findOne({ schoolId: data.schoolId });

	if (schoolDetails) {
		const studentDetails = new studentModel({
			name: data.name,
			age: data.age,
			schoolId: data.schoolId,
		});

		studentData = await studentDetails.save();

		let webhookUrl = "";

		for (let i = 0; i < schoolDetails.webhookDetails.length; i++) {
			if (schoolDetails.webhookDetails[i].eventName === "newStudentAdd") {
				webhookUrl = schoolDetails.webhookDetails[i].endpointUrl;
			}
		}

		if (webhookUrl != null && webhookUrl.length > 0) {
			let result = await axios.post(webhookUrl, studentData, {
				headers: {
					"Content-Type": "application/json",
				},
			});
			console.log("Webhook data send");
		}
	} else {
		console.log("No school");
	}

	res.send({
		result: "added successfully: " + studentData.name,
	});
});

app.listen(PORT, () => {
	console.log(`Server running at: http://localhost:${PORT}/`);
});

mongoose.connection.on("connected", () => {
	console.log("Mongoose connected");
});
