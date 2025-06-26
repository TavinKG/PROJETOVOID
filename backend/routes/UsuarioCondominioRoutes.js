const express = require('express');
const UsuarioCondominioController = require('../controllers/UsuarioCondominioController');

const router = express.Router();

router.post('/vinculo', UsuarioCondominioController.criarVinculo);

router.put('/vinculo/status', UsuarioCondominioController.alterarStatus);

router.get('/:userId/ativos', UsuarioCondominioController.listarCondominiosAtivos);
router.get('/:condominioId/pendentes', UsuarioCondominioController.listarSolicitacoesPendentes);

module.exports = router;
