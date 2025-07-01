const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
	{
		type: { type: String, required: true },
		deployedAddress: { type: String },
		walletAddress: { type: String, required: true },
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		hash: { type: String, required: true, unique: true },
		metadata: mongoose.Schema.Types.Mixed,
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
