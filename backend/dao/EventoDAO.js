// dao/EventoDAO.js

const supabase = require('../config/supabase'); // Configuração do Supabase
const Evento = require('../models/Evento'); // Classe Evento

class EventoDAO {

    /**
     * Insere um novo evento no banco de dados.
     * @param {Evento} evento O objeto Evento a ser inserido.
     * @returns {Promise<Array>} Os dados do evento inserido.
     */
    static async criarEvento(evento) {
        const { nome, dataHora, local, descricao, condominioId, criadorId } = evento;

        const { data, error } = await supabase
            .from('evento') // Nome da sua tabela de eventos
            .insert([{
                nome: nome,
                data_hora: dataHora,
                local: local,
                descricao: descricao,
                condominio_id: condominioId,
                criador_id: criadorId
            }])
            .select(); // Retorna os dados inseridos

        if (error) {
            console.error('Erro Supabase ao criar evento:', error);
            throw new Error(`Erro ao criar evento: ${error.message}`);
        }

        console.log("Evento criado com sucesso:", data);
        return data; // Retorna os dados inseridos
    }

    /**
     * Lista todos os eventos de um condomínio específico.
     * @param {number} condominioId O ID do condomínio.
     * @returns {Promise<Array>} Um array de objetos de evento.
     */
    static async listarEventosPorCondominio(condominioId) {
        try {
            const { data, error } = await supabase
                .from('evento')
                .select(`
                    id,
                    nome,
                    data_hora,
                    local,
                    descricao,
                    condominio_id,
                    criador_id,
                    criado_em,
                    criador:usuario(nome, email)
                `)
                .eq('condominio_id', condominioId)
                .order('data_hora', { ascending: true });

            if (error) {
                console.error('Erro Supabase ao listar eventos por condomínio:', error);
                throw new Error(`Erro ao listar eventos: ${error.message}`);
            }

            // CORREÇÃO AQUI: Garante que 'data' é um array antes de mapear.
            // Se 'data' for null ou undefined (ex: nenhuma linha encontrada sem erro),
            // ele inicializa como um array vazio para evitar o ReferenceError.
            const eventosFormatadas = data ? data.map(evento => ({
                ...evento,
                criador: evento.criador || null
            })) : []; 

            return eventosFormatadas; 
        } catch (error) {
            console.error('Erro na DAO ao listar eventos por condomínio:', error);
            throw new Error('Erro ao listar eventos do condomínio.');
        }
    }

    // Futuras funções para o módulo de Eventos (ex: confirmar presença, editar, excluir)
    // static async confirmarPresenca(eventoId, usuarioId) { ... }
    // static async verificarPresenca(eventoId, usuarioId) { ... }
    // static async listarParticipantesEvento(eventoId) { ... }
    // static async deletarEvento(eventoId) { ... }
}

module.exports = EventoDAO;