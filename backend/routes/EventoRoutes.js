
const express = require('express');
const EventoController = require('../controllers/EventoController');

const router = express.Router();

router.post('/agendar', EventoController.agendarEvento);

router.get('/condominio/:condominioId', EventoController.listarEventos);

module.exports = router;