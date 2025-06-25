// controllers/EventoController.js

const EventoDAO = require('../dao/EventoDAO');
const Evento = require('../models/Evento');

class EventoController {

    /**
     * Agenda um novo evento.
     * @param {object} req Objeto de requisição.
     * @param {object} res Objeto de resposta.
     */
    static async agendarEvento(req, res) {
        const { nome, data_hora, local, descricao, condominio_id, criador_id } = req.body; // Campos esperados do frontend

        if (!nome || !data_hora || !local || !condominio_id || !criador_id) {
            return res.status(400).json({ message: 'Nome, data/hora, local, ID do condomínio e criador são obrigatórios.' });
        }

        // Validação adicional de data/hora (já feita no frontend, mas bom ter no backend)
        const eventoDateTime = new Date(data_hora);
        if (isNaN(eventoDateTime.getTime()) || eventoDateTime < new Date()) { // Compara com a data/hora atual
            return res.status(400).json({ message: 'Data e hora do evento inválidas ou no passado.' });
        }

        try {
            const novoEvento = new Evento(
                null, // ID será gerado pelo banco
                nome,
                data_hora,
                local,
                descricao,
                condominio_id,
                criador_id
            );

            const eventoCriado = await EventoDAO.criarEvento(novoEvento);

            res.status(201).json({
                message: 'Evento agendado com sucesso!',
                data: eventoCriado,
            });

        } catch (error) {
            console.error('Erro ao agendar evento:', error);
            res.status(500).json({ message: `Erro ao agendar evento: ${error.message}` });
        }
    }

    /**
     * Lista todos os eventos de um condomínio específico.
     * @param {object} req Objeto de requisição.
     * @param {object} res Objeto de resposta.
     */
    static async listarEventos(req, res) {
        const { condominioId } = req.params; // Pega o ID do condomínio da URL

        if (!condominioId) {
            return res.status(400).json({ message: 'ID do condomínio é obrigatório para listar eventos.' });
        }

        try {
            const eventos = await EventoDAO.listarEventosPorCondominio(condominioId);
            
            if (!eventos || eventos.length === 0) {
                return res.status(200).json({ message: 'Nenhum evento encontrado para este condomínio.', eventos: [] });
            }

            res.status(200).json({ message: 'Eventos listados com sucesso!', eventos: eventos });

        } catch (error) {
            console.error('Erro ao listar eventos:', error);
            res.status(500).json({ message: `Erro ao listar eventos: ${error.message}` });
        }
    }

    // Futuras funções para o módulo de Eventos (ex: confirmar presença, editar, excluir)
    // static async confirmarPresenca(req, res) { ... }
    // static async listarParticipantes(req, res) { ... }
    // static async deletarEvento(req, res) { ... }
}

module.exports = EventoController;