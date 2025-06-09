// routes/AssembleiaRoutes.js

const express = require('express');
const AssembleiaController = require('../controllers/AssembleiaController');

const router = express.Router();

// Rota para administradores agendarem uma nova assembleia
router.post('/agendar', AssembleiaController.agendarAssembleia);

// Rota para listar todas as assembleias de um condomínio
router.get('/condominio/:condominioId', AssembleiaController.listarAssembleias);

// Rota para moradores confirmarem presença em uma assembleia
router.put('/:assembleiaId/confirmar-presenca', AssembleiaController.confirmarPresenca);


module.exports = router;