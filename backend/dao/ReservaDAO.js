const supabase = require('../config/supabase'); // Configuração do Supabase
const Reserva = require('../models/Reserva'); // Classe Reserva

class ReservaDAO {

    static async criarReserva(reserva) {
        const { areaId, usuarioId, dataInicio, dataFim, status, titulo, observacoes } = reserva;

        // Inserindo o registro na tabela "reservas"
        const { data, error } = await supabase
            .from('reservas')
            .insert([{
                area_id: areaId,
                usuario_id: usuarioId,
                data_inicio: dataInicio,
                data_fim: dataFim,
                status: status,
                titulo: titulo,
                observacoes: observacoes
            }])
            .select(); // Retorna os dados inseridos

        if (error) {
            console.error('Erro Supabase ao criar reserva:', error);
            throw new Error(`Erro ao criar reserva: ${error.message}`);
        }

        console.log("Reserva criada com sucesso:", data);
        return data; // Retorna os dados inseridos
    }

    // --- Futuras Funções DAO para Reserva ---
    // static async buscarReservasPorAreaEData(areaId, data) { ... }
    // static async alterarStatusReserva(reservaId, novoStatus) { ... }
    // static async listarReservasPendentesCondominio(condominioId) { ... }
    // static async listarMinhasReservas(usuarioId) { ... }
}

module.exports = ReservaDAO;