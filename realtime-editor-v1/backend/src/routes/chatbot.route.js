const express = require('express');
const route = express.Router();
const chatbotController = require('../controllers/chatbot.controller');

route.post('/chatbot', chatbotController.getAnswers);

module.exports = route;