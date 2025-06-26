
const supabase = require('../config/supabase');
const Evento = require('../models/Evento');

class EventoDAO {

    /**
     * Insere um novo evento no banco de dados.
     * @param {Evento} evento O objeto Evento a ser inserido.
     * @returns {Promise<Array>} Os dados do evento inserido.
     */
    static async criarEvento(evento) {
        const { nome, dataHora, local, descricao, condominioId, criadorId } = evento;

        const { data, error } = await supabase
            .from('evento')
            .insert([{
                nome: nome,
                data_hora: dataHora,
                local: local,
                descricao: descricao,
                condominio_id: condominioId,
                criador_id: criadorId
            }])
            .select();

        if (error) {
            console.error('Erro Supabase ao criar evento:', error);
            throw new Error(`Erro ao criar evento: ${error.message}`);
        }

        console.log("Evento criado com sucesso:", data);
        return data;
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

}

module.exports = EventoDAO;