const express = require('express');
const axios = require('axios');
const router = express.Router();

const RPC_URL = 'https://devnet.dplabs-internal.com'; 

router.post('/rpc', async (req, res) => {
  try {
    const response = await axios.post(RPC_URL, req.body, {
      headers: { 'Content-Type': 'application/json' },
    });
    console.log(response.data)
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data,
    });
  }
});

module.exports = router;
