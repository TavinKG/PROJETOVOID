
const express = require('express');
const FotoController = require('../controllers/FotoController');
const multer = require('multer');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/upload', upload.single('file'), FotoController.uploadFoto);

router.get('/galeria/:galeriaId', FotoController.listarFotos);

router.put('/:fotoId/status', FotoController.alterarStatusFoto);

module.exports = router;