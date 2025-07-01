const Transaction = require("../models/Transaction");
const User = require("../models/User");

exports.createTransaction = async (req, res) => {
	try {
		const { walletAddress, ...txData } = req.body;

		if (!walletAddress) {
			return res.status(400).json({ error: "walletAddress is required." });
		}

		// Find or create the user
		let user = await User.findOne({
			walletAddress: walletAddress.toLowerCase(),
		});

		if (!user) {
			user = await User.create({ walletAddress: walletAddress.toLowerCase() });
		}

		// Create the transaction
		const newTx = await Transaction.create({
			...txData,
			walletAddress: walletAddress.toLowerCase(),
			user: user._id,
		});

		res.status(201).json(newTx);
	} catch (err) {
		console.error("Create Transaction Error:", err.message);
		res.status(500).json({ error: err.message });
	}
};

exports.getTransactionsByUser = async (req, res) => {
	try {
		const walletAddress = req.params.wallet.toLowerCase();
		const user = await User.findOne({ walletAddress });

		if (!user) return res.status(404).json({ error: "User not found" });

		const txs = await Transaction.find({ user: user._id }).populate(
			"user",
			"walletAddress otherDetails"
		);
		res.json(txs);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

/**
 * Get all transactions of a specific type
 */
exports.getTransactionsByType = async (req, res) => {
	try {
		const { type } = req.params;

		const txs = await Transaction.find({ type }).populate(
			"user",
			"walletAddress otherDetails"
		);
		res.json(txs);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

/**
 * Get total number of transactions
 */
exports.getAllTransactionsCount = async (req, res) => {
	try {
		const count = await Transaction.countDocuments();
		res.json({ totalTransactions: count });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

/**
 * Get count of all transaction types (e.g., deposit, withdraw, etc.)
 */
exports.getTransactionCountsByType = async (req, res) => {
	try {
		const counts = await Transaction.aggregate([
			{ $group: { _id: "$type", count: { $sum: 1 } } },
			{ $project: { type: "$_id", count: 1, _id: 0 } },
		]);
		res.json(counts);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

/**
 * Get transaction count for a specific user
 */
exports.getUserTransactionCount = async (req, res) => {
	try {
		const walletAddress = req.params.wallet.toLowerCase();
		const user = await User.findOne({ walletAddress });

		if (!user) return res.status(404).json({ error: "User not found" });

		const count = await Transaction.countDocuments({ user: user._id });
		res.json({ walletAddress, transactionCount: count });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

exports.getUserTransactionTypeCounts = async (req, res) => {
	try {
		const walletAddress = req.params.wallet.toLowerCase();
		const user = await User.findOne({ walletAddress });

		if (!user) return res.status(404).json({ error: "User not found" });

		const counts = await Transaction.aggregate([
			{ $match: { user: user._id } },
			{ $group: { _id: "$type", count: { $sum: 1 } } },
			{ $project: { type: "$_id", count: 1, _id: 0 } },
		]);

		res.json({
			walletAddress,
			transactionTypeCounts: counts,
		});
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

/**
 * Get top users with their transaction counts (paginated)
 */
exports.getTopUsersWithTransactionCount = async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const skip = (page - 1) * limit;

		const result = await Transaction.aggregate([
			{
				$group: {
					_id: "$user",
					transactionCount: { $sum: 1 },
				},
			},
			{
				$sort: { transactionCount: -1 },
			},
			{
				$lookup: {
					from: "users",
					localField: "_id",
					foreignField: "_id",
					as: "user",
				},
			},
			{ $unwind: "$user" },
			{ $skip: skip },
			{ $limit: limit },
			{
				$project: {
					_id: 0,
					userId: "$user._id",
					walletAddress: "$user.walletAddress",
					transactionCount: 1,
				},
			},
		]);

		res.json(result);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: err.message });
	}
};

/**
 * Get users with their transaction counts grouped by type (paginated)
 */
exports.getUsersWithTransactionTypeStats = async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const skip = (page - 1) * limit;

		const result = await Transaction.aggregate([
			{
				$group: {
					_id: { user: "$user", type: "$type" },
					count: { $sum: 1 },
				},
			},
			{
				$group: {
					_id: "$_id.user",
					transactionTypes: {
						$push: {
							type: "$_id.type",
							count: "$count",
						},
					},
				},
			},
			{
				$lookup: {
					from: "users",
					localField: "_id",
					foreignField: "_id",
					as: "user",
				},
			},
			{ $unwind: "$user" },
			{ $skip: skip },
			{ $limit: limit },
			{
				$project: {
					_id: 0,
					userId: "$user._id",
					walletAddress: "$user.walletAddress",
					transactionTypes: 1,
				},
			},
		]);

		res.json(result);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: err.message });
	}
};


exports.getAllTransactions = async (req, res) => {
	const txs = await Transaction.find();
	res.json(txs);
};

exports.getUsers = async (req, res) => {
	const users = await User.find();
	res.json(users);
};
