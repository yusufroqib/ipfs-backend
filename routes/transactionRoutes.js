const express = require("express");
const {
	createTransaction,
	getAllTransactions,
	getTransactionsByUser,
	getTransactionsByType,
	getAllTransactionsCount,
	getTransactionCountsByType,
	getUserTransactionCount,
	getTopUsersWithTransactionCount,
	getUsersWithTransactionTypeStats,
} = require("../controllers/transactionController");

const router = express.Router();

router.post("/", createTransaction);
router.get("/", getAllTransactions);
router.get("/user/:wallet", getTransactionsByUser);
router.get("/type/:type", getTransactionsByType);
router.get("/count/all", getAllTransactionsCount);
router.get("/count/type", getTransactionCountsByType);
router.get("/count/user/:wallet", getUserTransactionCount);

router.get("/top-users", getTopUsersWithTransactionCount);
router.get("/user-types", getUsersWithTransactionTypeStats);
module.exports = router;
