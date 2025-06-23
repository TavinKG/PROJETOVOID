// controllers/GaleriaController.js

const GaleriaDAO = require('../dao/GaleriaDAO');
const Galeria = require('../models/Galeria');

class GaleriaController {

    /**
     * Cria uma nova galeria (álbum de fotos).
     * @param {object} req Objeto de requisição.
     * @param {object} res Objeto de resposta.
     */
    static async criarGaleria(req, res) {
        const { nome, condominio_id, criador_id } = req.body; // Campos esperados do frontend

        if (!nome || !condominio_id || !criador_id) {
            return res.status(400).json({ message: 'Nome da galeria, ID do condomínio e ID do criador são obrigatórios.' });
        }

        try {
            const novaGaleria = new Galeria(
                null, // ID será gerado pelo banco
                nome,
                condominio_id,
                criador_id
                // fotoCapaUrl opcional, será atualizado se uma foto de capa for definida depois
            );

            const galeriaCriada = await GaleriaDAO.criarGaleria(novaGaleria);

            res.status(201).json({
                message: 'Galeria criada com sucesso!',
                data: galeriaCriada,
            });

        } catch (error) {
            console.error('Erro ao criar galeria:', error);
            res.status(500).json({ message: `Erro ao criar galeria: ${error.message}` });
        }
    }

    /**
     * Lista todas as galerias de um condomínio específico.
     * @param {object} req Objeto de requisição.
     * @param {object} res Objeto de resposta.
     */
    static async listarGalerias(req, res) {
        const { condominioId } = req.params;

        if (!condominioId) {
            return res.status(400).json({ message: 'ID do condomínio é obrigatório para listar galerias.' });
        }

        try {
            const galerias = await GaleriaDAO.listarGaleriasPorCondominio(condominioId);
            
            if (!galerias || galerias.length === 0) {
                return res.status(200).json({ message: 'Nenhuma galeria encontrada para este condomínio.', galerias: [] });
            }

            res.status(200).json({ message: 'Galerias listadas com sucesso!', galerias: galerias });

        } catch (error) {
            console.error('Erro ao listar galerias:', error);
            res.status(500).json({ message: `Erro ao listar galerias: ${error.message}` });
        }
    }

    // --- Futuros Métodos Controller para Galeria ---
    // static async atualizarGaleria(req, res) { ... }
    // static async deletarGaleria(req, res) { ... }
}

module.exports = GaleriaController;