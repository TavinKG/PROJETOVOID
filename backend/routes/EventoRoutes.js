// routes/EventoRoutes.js

const express = require('express');
const EventoController = require('../controllers/EventoController');

const router = express.Router();

// Rota para administradores agendarem um novo evento
router.post('/agendar', EventoController.agendarEvento);

// Rota para listar todos os eventos de um condomínio
router.get('/condominio/:condominioId', EventoController.listarEventos);

module.exports = router;