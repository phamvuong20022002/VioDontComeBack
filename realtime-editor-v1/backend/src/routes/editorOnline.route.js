const express = require('express');
const route = express.Router();
const {editorOnline} = require('../controllers/editorOnline.controller');

route.get('/', editorOnline);

module.exports = route;