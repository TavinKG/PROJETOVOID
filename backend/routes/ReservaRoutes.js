// routes/ReservaRoutes.js

const express = require('express');
const ReservaController = require('../controllers/ReservaController');

const router = express.Router();

// Rota para criar uma nova reserva
router.post('/criar', ReservaController.criarReserva);

// --- Futuras Rotas de Reserva ---
// router.get('/disponibilidade/:areaId/:data', ReservaController.verificarDisponibilidade);
// router.put('/:reservaId/status', ReservaController.aprovarOuRecusarReserva);

module.exports = router;