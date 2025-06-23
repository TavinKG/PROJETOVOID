// routes/FotoRoutes.js

const express = require('express');
const FotoController = require('../controllers/FotoController');
const multer = require('multer'); // Importa o multer

const router = express.Router();

// Configuração do Multer para upload em memória (para passar o buffer para o Supabase Storage)
const storage = multer.memoryStorage(); // Armazena o arquivo na memória como um Buffer
const upload = multer({ storage: storage });

// Rota para fazer upload de uma foto
// `upload.single('file')` indica que esperamos um único arquivo no campo 'file' do formulário
router.post('/upload', upload.single('file'), FotoController.uploadFoto);

// Rota para listar fotos de uma galeria específica
router.get('/galeria/:galeriaId', FotoController.listarFotos);

module.exports = router;