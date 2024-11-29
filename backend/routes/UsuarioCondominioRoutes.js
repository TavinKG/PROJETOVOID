const express = require('express');
const UsuarioCondominioController = require('../controllers/UsuarioCondominioController');

const router = express.Router();

// Rota para criar um vínculo entre usuário e condomínio
router.post('/vinculo', UsuarioCondominioController.criarVinculo);

// Rota para alterar o status de um vínculo existente
router.put('/vinculo/status', UsuarioCondominioController.alterarStatus);

router.get('/:userId/ativos', UsuarioCondominioController.listarCondominiosAtivos);
router.get('/:condominioId/pendentes', UsuarioCondominioController.listarSolicitacoesPendentes);

module.exports = router;
