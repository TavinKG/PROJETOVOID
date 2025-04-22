const express = require('express');
const AvisoController = require('../controllers/AvisoController');

const router = express.Router();

router.post('/register', AvisoController.register);
router.get('/:condominioID/list', AvisoController.listarAvisos);

module.exports = router;