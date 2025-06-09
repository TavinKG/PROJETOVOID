// routes/ReservaRoutes.js

const express = require('express');
const ReservaController = require('../controllers/ReservaController');

const router = express.Router();

// Rota para criar uma nova reserva
router.post('/criar', ReservaController.criarReserva);
router.get('/usuario/:userId/condominio/:condominioId', ReservaController.listarReservasDoUsuario);
router.get('/condominio/:condominioId', ReservaController.listarTodasReservas);
router.put('/:reservaId/status', ReservaController.alterarStatusReserva);
router.get('/disponibilidade/:areaId/:date', ReservaController.verificarDisponibilidade);

// --- Futuras Rotas de Reserva ---
// router.get('/disponibilidade/:areaId/:data', ReservaController.verificarDisponibilidade);
// router.put('/:reservaId/status', ReservaController.aprovarOuRecusarReserva);

module.exports = router;