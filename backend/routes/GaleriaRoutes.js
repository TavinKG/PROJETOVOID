// routes/GaleriaRoutes.js

const express = require('express');
const GaleriaController = require('../controllers/GaleriaController');

const router = express.Router();

// Rota para criar uma nova galeria (álbum)
router.post('/criar', GaleriaController.criarGaleria);

// Rota para listar todas as galerias de um condomínio
router.get('/condominio/:condominioId', GaleriaController.listarGalerias);

module.exports = router;