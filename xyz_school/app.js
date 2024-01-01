const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = 4100;
app.use(bodyParser.json());

app.get("/", (req, res) => {
	res.send("Welcome to xyz School");
});

app.post("/webhook/studentAdded", (req, res) => {
	let data = req.body;
	console.log("name: " + data.name);

	res.send("Webhook data recieved");
});

app.listen(PORT, () => {
	console.log(`Server running at: http://localhost:${PORT}/`);
});
