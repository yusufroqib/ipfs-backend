const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { uploadImage } = require("./uploadImage.js");
const rpcProxy = require("./routes/rpcProxy");
const connectDB = require("./config/db");
const transactionRoutes = require("./routes/transactionRoutes");
const priceRoute = require("./routes/price");
const app = express();
const port = 5000;

connectDB();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb" }));
app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	next();
});

app.post("/uploadImage", (req, res) => {
	uploadImage(req.body.image)
		.then((url) => res.send(url))
		.catch((err) => res.status(500).send(err));
});

app.use("/api", rpcProxy);
app.use("/api", priceRoute);
app.use("/api/transactions", transactionRoutes);

// app.post("/uploadMultipleImages", (req, res) => {
//   uploadImage
//     .uploadMultipleImages(req.body.images)
//     .then((urls) => res.send(urls))
//     .catch((err) => res.status(500).send(err));
//});

app.listen(port, () => {
	console.log(
		`ZetraFi backend server is listening at http://localhost:${port}`
	);
});
