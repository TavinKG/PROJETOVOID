const express = require('express');
const CondominioController = require('../controllers/CondominioController');

const router = express.Router();

router.post('/register', CondominioController.register);
router.get('/buscar/:cnpj', CondominioController.buscarPorCNPJ);
router.get('/:condominioId/areas-comuns', CondominioController.listarAreasComuns); 


module.exports = router;