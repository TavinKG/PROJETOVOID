const GaleriaDAO = require('../dao/GaleriaDAO');
const Galeria = require('../models/Galeria');

class GaleriaController {

    static async criarGaleria(req, res) {
        const { nome, condominio_id, criador_id } = req.body;

        if (!nome || !condominio_id || !criador_id) {
            return res.status(400).json({ message: 'Nome da galeria, ID do condomínio e ID do criador são obrigatórios.' });
        }

        try {
            const novaGaleria = new Galeria(
                null,
                nome,
                condominio_id,
                criador_id
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
}

module.exports = GaleriaController;