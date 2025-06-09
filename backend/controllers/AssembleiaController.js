// controllers/AssembleiaController.js

const AssembleiaDAO = require('../dao/AssembleiaDAO');
const Assembleia = require('../models/Assembleia');

class AssembleiaController {

    /**
     * Agenda uma nova assembleia.
     * @param {object} req Objeto de requisição.
     * @param {object} res Objeto de resposta.
     */
    static async agendarAssembleia(req, res) {
        const { titulo, data_hora, descricao, condominio_id, criador_id } = req.body;

        if (!titulo || !data_hora || !condominio_id || !criador_id) {
            return res.status(400).json({ message: 'Título, data/hora, ID do condomínio e criador são obrigatórios.' });
        }

        // Validação adicional de data/hora (já feita no frontend, mas bom ter no backend)
        const assembleiaDateTime = new Date(data_hora);
        if (isNaN(assembleiaDateTime.getTime()) || assembleiaDateTime < new Date()) {
            return res.status(400).json({ message: 'Data e hora da assembleia inválidas ou no passado.' });
        }

        try {
            const novaAssembleia = new Assembleia(
                null, // ID será gerado pelo banco
                titulo,
                data_hora,
                descricao,
                condominio_id,
                criador_id
            );

            const assembleiaCriada = await AssembleiaDAO.criarAssembleia(novaAssembleia);

            res.status(201).json({
                message: 'Assembleia agendada com sucesso!',
                data: assembleiaCriada,
            });

        } catch (error) {
            console.error('Erro ao agendar assembleia:', error);
            res.status(500).json({ message: `Erro ao agendar assembleia: ${error.message}` });
        }
    }

    /**
     * Lista assembleias para um condomínio específico.
     * @param {object} req Objeto de requisição.
     * @param {object} res Objeto de resposta.
     */
    static async listarAssembleias(req, res) {
        const { condominioId } = req.params;

        if (!condominioId) {
            return res.status(400).json({ message: 'ID do condomínio é obrigatório para listar assembleias.' });
        }

        try {
            const assembleias = await AssembleiaDAO.listarAssembleiasPorCondominio(condominioId);
            
            if (!assembleias || assembleias.length === 0) {
                return res.status(200).json({ message: 'Nenhuma assembleia encontrada para este condomínio.', assembleias: [] });
            }

            res.status(200).json({ message: 'Assembleias listadas com sucesso!', assembleias: assembleias });

        } catch (error) {
            console.error('Erro ao listar assembleias:', error);
            res.status(500).json({ message: `Erro ao listar assembleias: ${error.message}` });
        }
    }

    /**
     * Permite a um usuário confirmar presença em uma assembleia.
     * @param {object} req Objeto de requisição.
     * @param {object} res Objeto de resposta.
     */
    static async confirmarPresenca(req, res) {
        const { assembleiaId } = req.params;
        const { usuarioId } = req.body; // ID do usuário que está confirmando

        if (!assembleiaId || !usuarioId) {
            return res.status(400).json({ message: 'ID da assembleia e ID do usuário são obrigatórios para confirmar presença.' });
        }

        try {
            const jaConfirmou = await AssembleiaDAO.verificarPresenca(assembleiaId, usuarioId);
            if (jaConfirmou) {
                return res.status(409).json({ message: 'Presença já confirmada para esta assembleia.' });
            }

            await AssembleiaDAO.confirmarPresenca(assembleiaId, usuarioId);

            res.status(200).json({ message: 'Presença confirmada com sucesso!' });

        } catch (error) {
            console.error('Erro ao confirmar presença:', error);
            res.status(500).json({ message: `Erro ao confirmar presença: ${error.message}` });
        }
    }

    static async listarAssembleias(req, res) {
        const { condominioId } = req.params;
        const userId = req.headers['x-user-id'] || req.query.userId; // NOVO: Pega o userId do header ou query (melhor do header para autenticação)

        if (!condominioId) {
            return res.status(400).json({ message: 'ID do condomínio é obrigatório para listar assembleias.' });
        }

        try {
            // NOVO: Passa o userId para a DAO
            const assembleias = await AssembleiaDAO.listarAssembleiasPorCondominio(condominioId, userId);
            
            if (!assembleias || assembleias.length === 0) {
                return res.status(200).json({ message: 'Nenhuma assembleia encontrada para este condomínio.', assembleias: [] });
            }

            res.status(200).json({ message: 'Assembleias listadas com sucesso!', assembleias: assembleias });

        } catch (error) {
            console.error('Erro ao listar assembleias:', error);
            res.status(500).json({ message: `Erro ao listar assembleias: ${error.message}` });
        }
    }
}

module.exports = AssembleiaController;