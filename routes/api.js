const express = require('express');
const router = express.Router();

const User = require("../models/User");
const Ticket = require('../models/Ticket');
const Feedback = require('../models/Feedback');
const Message = require("../models/Messages")
const Reward = require('../models/Reward')
const Request = require('../models/Request');

router.get('/requests', async (req, res) => {
    return res.json({
        total: await Request.count(),
        rows: await Request.findAll()
    })
});

module.exports = router;