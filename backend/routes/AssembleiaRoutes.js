// routes/AssembleiaRoutes.js

const express = require('express');
const AssembleiaController = require('../controllers/AssembleiaController');

const router = express.Router();

router.post('/agendar', AssembleiaController.agendarAssembleia);
router.get('/condominio/:condominioId', AssembleiaController.listarAssembleias);
router.put('/:assembleiaId/confirmar-presenca', AssembleiaController.confirmarPresenca);

// NOVA ROTA: Listar participantes de uma assembleia
router.get('/:assembleiaId/participantes', AssembleiaController.listarParticipantes);


module.exports = router;