
const express = require('express');
const ReservaController = require('../controllers/ReservaController');

const router = express.Router();

router.post('/criar', ReservaController.criarReserva);
router.get('/usuario/:userId/condominio/:condominioId', ReservaController.listarReservasDoUsuario);
router.get('/condominio/:condominioId', ReservaController.listarTodasReservas);
router.put('/:reservaId/status', ReservaController.alterarStatusReserva);
router.get('/disponibilidade/:areaId/:date', ReservaController.verificarDisponibilidade);


module.exports = router;