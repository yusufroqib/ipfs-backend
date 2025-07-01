const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
	{
		walletAddress: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
		},

		otherDetails: mongoose.Schema.Types.Mixed, // any other info
	},
	{ timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
