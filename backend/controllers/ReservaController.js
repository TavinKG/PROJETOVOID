const ReservaDAO = require('../dao/ReservaDAO');
const Reserva = require('../models/Reserva');

class ReservaController {

    static async criarReserva(req, res) {
        const { areaId, usuarioId, dataInicio, dataFim, titulo, observacoes, condominioId } = req.body;

        if (!areaId || !usuarioId || !dataInicio || !dataFim || !condominioId) {
            return res.status(400).json({ message: 'Dados mínimos da reserva incompletos (areaId, usuarioId, dataInicio, dataFim, condominioId são obrigatórios).' });
        }

        const statusInicial = '0';

        try {
            const conflitingReservas = await ReservaDAO.buscarReservasConflitantes(areaId, dataInicio, dataFim);

            if (conflitingReservas && conflitingReservas.length > 0) {
                return res.status(409).json({ message: 'Conflito de horário: Esta área já está reservada ou solicitada para o período selecionado.' });
            }

            const novaReserva = new Reserva(
                null,
                areaId,
                usuarioId,
                dataInicio,
                dataFim,
                statusInicial,
                titulo,
                observacoes,
                condominioId
            );

            const reservaCriada = await ReservaDAO.criarReserva(novaReserva);

            res.status(201).json({
                message: 'Solicitação de reserva criada com sucesso!',
                data: reservaCriada,
            });

        } catch (error) {
            console.error('Erro ao criar solicitação de reserva:', error);
            res.status(500).json({ message: `Erro ao criar solicitação de reserva: ${error.message}` });
        }
    }

    static async listarReservasDoUsuario(req, res) {
        const { userId, condominioId } = req.params;

        try {
            const reservas = await ReservaDAO.listarReservasPorUsuarioECondominio(userId, condominioId);
            
            if (!reservas || reservas.length === 0) {
                return res.status(200).json({ message: 'Nenhuma reserva encontrada para este usuário neste condomínio.', reservas: [] });
            }

            res.status(200).json({ message: 'Reservas listadas com sucesso!', reservas: reservas });

        } catch (error) {
            console.error('Erro ao listar reservas do usuário:', error);
            res.status(500).json({ message: `Erro ao listar reservas do usuário: ${error.message}` });
        }
    }

    static async listarTodasReservas(req, res) {
        const { condominioId } = req.params;
        const { areaId, status, date } = req.query;

        const filters = { areaId, status, date };

        try {
            const reservas = await ReservaDAO.listarTodasReservasPorCondominio(condominioId, filters);
            
            if (!reservas || reservas.length === 0) {
                return res.status(200).json({ message: 'Nenhuma reserva encontrada para este condomínio com os filtros aplicados.', reservas: [] });
            }

            res.status(200).json({ message: 'Reservas listadas com sucesso!', reservas: reservas });

        } catch (error) {
            console.error('Erro ao listar todas as reservas:', error);
            res.status(500).json({ message: `Erro ao listar todas as reservas: ${error.message}` });
        }
    }

    static async alterarStatusReserva(req, res) {
        const { reservaId } = req.params;
        const { status } = req.body;


        const statusPermitidos = ['0', '1', '2', '5'];
        if (!statusPermitidos.includes(status)) {
            return res.status(400).json({ message: 'Status inválido fornecido.' });
        }

        try {
            const reservaAtualizada = await ReservaDAO.alterarStatusReserva(reservaId, status);

            if (!reservaAtualizada || reservaAtualizada.length === 0) {
                return res.status(404).json({ message: 'Reserva não encontrada ou status não pôde ser atualizado.' });
            }

            res.status(200).json({ message: 'Status da reserva atualizado com sucesso!', data: reservaAtualizada[0] });

        } catch (error) {
            console.error('Erro ao alterar status da reserva:', error);
            res.status(500).json({ message: `Erro ao alterar status da reserva: ${error.message}` });
        }
    }

    static async verificarDisponibilidade(req, res) {
        const { areaId, date } = req.params;

        if (!areaId || !date) {
            return res.status(400).json({ message: 'areaId e date são obrigatórios para verificar a disponibilidade.' });
        }

        try {
            const existingReservas = await ReservaDAO.buscarReservasPorAreaEData(areaId, date);

            const allSlots = [];
            const startHour = 10;
            const endHour = 22;
            const interval = 3;

            for (let hour = startHour; hour < endHour; hour += interval) {
                const formattedHour = String(hour).padStart(2, '0');
                const slotTimeStr = `${formattedHour}:00`;

                const slotStart = new Date(`${date}T${slotTimeStr}:00.000Z`);
                const slotEnd = new Date(slotStart.getTime() + interval * 60 * 60 * 1000);

                let isAvailable = true;

                for (const reserva of existingReservas) {
                    const reservaStart = new Date(reserva.data_inicio); 
                    const reservaEnd = new Date(reserva.data_fim);  

                    if (
                        (slotStart.getTime() < reservaEnd.getTime() && slotEnd.getTime() > reservaStart.getTime())
                    ) {
                        isAvailable = false; 
                        break;
                    }
                }
                allSlots.push({ time: slotTimeStr, isAvailable: isAvailable });
            }

            res.status(200).json({ message: 'Disponibilidade verificada com sucesso!', date: date, slots: allSlots });

        } catch (error) {
            console.error('Erro ao verificar disponibilidade:', error);
            res.status(500).json({ message: `Erro ao verificar disponibilidade: ${error.message}` });
        }
    }
}

module.exports = ReservaController;