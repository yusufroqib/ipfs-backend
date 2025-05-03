const express = require('express');
const { getSupraOraclePrice } = require('../supraOracle/getSupraOraclePrice');
const router = express.Router();

router.get('/get-price', async (req, res) => {
  try {
    const priceData = await getSupraOraclePrice()
    res.status(200).json(priceData);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data,
    });
  }
});

module.exports = router;