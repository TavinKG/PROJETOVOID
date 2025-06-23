// controllers/FotoController.js

const FotoDAO = require('../dao/FotoDAO');
const Foto = require('../models/Foto');

class FotoController {

    /**
     * Lida com o upload de uma foto, salvando no Storage e registrando no BD.
     * Requer o middleware `multer` para processar o arquivo.
     * @param {object} req Objeto de requisição (req.file contém o arquivo, req.body outros dados).
     * @param {object} res Objeto de resposta.
     */
    static async uploadFoto(req, res) {
        // req.file é preenchido pelo multer
        if (!req.file) {
            return res.status(400).json({ message: 'Nenhum arquivo de imagem foi enviado.' });
        }

        const { descricao, galeria_id, usuario_id, status } = req.body; // Dados do formulário
        
        // Validações básicas
        if (!galeria_id || !usuario_id) {
            return res.status(400).json({ message: 'ID da galeria e ID do usuário são obrigatórios para o upload da foto.' });
        }
        // O status pode ser 'pendente' ou 'aprovada'. Se não vier, define padrão.
        const fotoStatus = status || 'aprovada'; // Ou 'pendente' se morador puder enviar

        try {
            // 1. Fazer upload do arquivo para o Supabase Storage
            const publicUrl = await FotoDAO.uploadFotoToStorage(req.file, usuario_id);

            // 2. Criar o registro da foto no banco de dados
            const novaFoto = new Foto(
                null, // ID será gerado pelo banco
                publicUrl,
                descricao,
                galeria_id,
                usuario_id,
                fotoStatus
            );

            const fotoCriada = await FotoDAO.criarFoto(novaFoto);

            res.status(201).json({
                message: 'Foto enviada e registrada com sucesso!',
                data: fotoCriada,
                url: publicUrl // Inclui a URL pública na resposta
            });

        } catch (error) {
            console.error('Erro ao fazer upload da foto:', error);
            res.status(500).json({ message: `Erro ao fazer upload da foto: ${error.message}` });
        }
    }

    /**
     * Lista todas as fotos de uma galeria específica.
     * @param {object} req Objeto de requisição.
     * @param {object} res Objeto de resposta.
     */
    static async listarFotos(req, res) {
        const { galeriaId } = req.params;

        if (!galeriaId) {
            return res.status(400).json({ message: 'ID da galeria é obrigatório para listar fotos.' });
        }

        try {
            const fotos = await FotoDAO.listarFotosPorGaleria(galeriaId);
            
            if (!fotos || fotos.length === 0) {
                return res.status(200).json({ message: 'Nenhuma foto encontrada para esta galeria.', fotos: [] });
            }

            res.status(200).json({ message: 'Fotos listadas com sucesso!', fotos: fotos });

        } catch (error) {
            console.error('Erro ao listar fotos:', error);
            res.status(500).json({ message: `Erro ao listar fotos: ${error.message}` });
        }
    }

    // --- Futuros Métodos Controller para Foto ---
    // static async alterarStatusFoto(req, res) { ... } // Para moderação de fotos
    // static async deletarFoto(req, res) { ... }
}

module.exports = FotoController;