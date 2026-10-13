// signinRoute.js: Nhận request từ client theo URL + method.
const express = require('express');
const router = express.Router();
const { login } = require('./signinController');

router.post('/signin', login);

module.exports = router;