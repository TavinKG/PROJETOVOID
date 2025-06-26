
const express = require('express');
const GaleriaController = require('../controllers/GaleriaController');

const router = express.Router();

router.post('/criar', GaleriaController.criarGaleria);

router.get('/condominio/:condominioId', GaleriaController.listarGalerias);

module.exports = router;