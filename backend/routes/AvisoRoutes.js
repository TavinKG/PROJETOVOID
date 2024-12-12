const express = require('express');
const AvisoController = require('../controllers/AvisoController');

const router = express.Router();

router.post('/register', AvisoController.register);

module.exports = router;