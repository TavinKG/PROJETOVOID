const express = require('express');
const UsuarioController = require('../controllers/UsuarioController');

const router = express.Router();

router.post('/register', UsuarioController.register);
router.post('/login', UsuarioController.login);

module.exports = router;