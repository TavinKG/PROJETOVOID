// dao/ReservaDAO.js

const supabase = require('../config/supabase');
const Reserva = require('../models/Reserva');

class ReservaDAO {

    static async criarReserva(reserva) {
        const { areaId, usuarioId, dataInicio, dataFim, status, titulo, observacoes, condominioId } = reserva; // NOVO: Adicionado condominioId

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
                observacoes: observacoes,
                condominio_id: condominioId // NOVO: Inserindo o condominio_id
            }])
            .select(); // Retorna os dados inseridos

        if (error) {
            console.error('Erro Supabase ao criar reserva:', error);
            throw new Error(`Erro ao criar reserva: ${error.message}`);
        }

        console.log("Reserva criada com sucesso:", data);
        return data; // Retorna os dados inseridos
    }

    // Listar reservas de um usuário para um condomínio específico
    static async listarReservasPorUsuarioECondominio(usuarioId, condominioId) {
        try {
            const { data, error } = await supabase
                .from('reservas')
                .select(`
                    *,
                    areas_comuns(nome) // GARANTA QUE ISTO ESTÁ CORRETO
                `)
                .eq('usuario_id', usuarioId)
                .eq('condominio_id', condominioId)
                .order('data_inicio', { ascending: false });

            if (error) {
                console.error('Erro Supabase ao buscar reservas por usuário e condomínio:', error);
                throw new Error(`Erro ao buscar reservas: ${error.message}`);
            }

            // O Supabase deve retornar 'area' como um objeto { nome: '...' }.
            // Se ainda vier null, o problema é na chave estrangeira ou RLS.
            const reservasFormatadas = data.map(reserva => ({
                ...reserva,
                area: reserva.areas_comuns || { nome: 'Nome da Área Indisponível' } // Fallback mais útil
            }));

            return reservasFormatadas;
        } catch (error) {
            console.error('Erro na DAO ao listar reservas por usuário e condomínio:', error);
            throw new Error('Erro ao listar reservas do usuário e condomínio.');
        }
    }

    static async listarTodasReservasPorCondominio(condominioId, filters = {}) { // NOVO: Aceita um objeto filters
        let query = supabase
            .from('reservas')
            .select(`
                *,
                areas_comuns(nome),
                usuario(nome, email)
            `)
            .eq('condominio_id', condominioId);

        // APLICAÇÃO DOS FILTROS
        if (filters.areaId) {
            query = query.eq('area_id', filters.areaId);
        }
        if (filters.status !== undefined && filters.status !== null && filters.status !== '') { // Permite filtrar por status '0'
            query = query.eq('status', filters.status);
        }
        if (filters.date) {
            // Para filtrar por data, assumimos que 'date' vem como YYYY-MM-DD
            // E a coluna data_inicio é TIMESTAMP WITH TIME ZONE
            // Filtra por reservas que iniciam NO DIA ESPECÍFICO
            const startDate = `${filters.date}T00:00:00.000Z`;
            const endDate = `${filters.date}T23:59:59.999Z`;
            query = query.gte('data_inicio', startDate).lte('data_inicio', endDate);
        }

        query = query.order('criado_em', { ascending: false });

        const { data, error } = await query;

        if (error) {
            console.error('Erro Supabase ao buscar todas as reservas por condomínio com filtros:', error);
            throw new Error(`Erro ao buscar todas as reservas: ${error.message}`);
        }

        const reservasFormatadas = data.map(reserva => ({
            ...reserva,
            areas_comuns: reserva.areas_comuns || null,
            usuario: reserva.usuario || null
        }));

        return reservasFormatadas;
    }

    // NOVO MÉTODO: Alterar status de uma reserva
    static async alterarStatusReserva(reservaId, novoStatus) {
        try {
            const { data, error } = await supabase
                .from('reservas')
                .update({ status: novoStatus })
                .eq('id', reservaId)
                .select(); // Retorna os dados atualizados

            if (error) {
                console.error('Erro Supabase ao alterar status da reserva:', error);
                throw new Error(`Erro ao alterar status da reserva: ${error.message}`);
            }

            console.log("Status da reserva atualizado com sucesso:", data);
            return data;
        } catch (error) {
            console.error('Erro na DAO ao alterar status da reserva:', error);
            throw new Error('Erro ao alterar status da reserva.');
        }
    }

    static async buscarReservasPorAreaEData(areaId, date) {
        try {
            // date deve ser uma string no formato 'YYYY-MM-DD'
            // Precisamos buscar reservas que se sobrepõem a QUALQUER momento do dia
            const startOfDay = `${date}T00:00:00.000Z`;
            const endOfDay = `${date}T23:59:59.999Z`;

            const { data, error } = await supabase
                .from('reservas')
                .select('data_inicio, data_fim, status') // Seleciona apenas o que é necessário para verificar a disponibilidade
                .eq('area_id', areaId)
                .in('status', ['0', '1']) // Filtra por status 'pendente' ou 'aprovada'
                // Filtra as reservas que se sobrepõem ao dia
                .gte('data_fim', startOfDay) // A reserva termina depois do início do dia
                .lte('data_inicio', endOfDay); // A reserva começa antes do final do dia
            
            if (error) {
                console.error('Erro Supabase ao buscar reservas por área e data:', error);
                throw new Error(`Erro ao buscar reservas por área e data: ${error.message}`);
            }
            
            return data; // Retorna as reservas encontradas
        } catch (error) {
            console.error('Erro na DAO ao buscar reservas por área e data:', error);
            throw new Error('Erro ao buscar reservas por área e data.');
        }
    }

    static async buscarReservasConflitantes(areaId, dataInicio, dataFim) {
        try {
            // Converte as datas para o formato ISO string (UTC) para garantir comparação correta no banco
            const startISO = new Date(dataInicio).toISOString();
            const endISO = new Date(dataFim).toISOString();

            const { data, error } = await supabase
                .from('reservas')
                .select('id, data_inicio, data_fim, status') // Seleciona apenas o que é necessário para verificar conflito
                .eq('area_id', areaId)
                .in('status', ['0', '1']) // Filtra por status '0' (pendente) ou '1' (aprovada)
                // Verifica sobreposição de intervalos:
                // (startA < endB) AND (endA > startB)
                .lt('data_inicio', endISO)  // A nova reserva começa ANTES da reserva existente terminar
                .gt('data_fim', startISO);  // A nova reserva termina DEPOIS da reserva existente começar
            
            if (error) {
                console.error('Erro Supabase ao buscar reservas conflitantes:', error);
                throw new Error(`Erro ao buscar reservas conflitantes: ${error.message}`);
            }

            return data; // Retorna as reservas que se sobrepõem
        } catch (error) {
            console.error('Erro na DAO ao buscar reservas conflitantes:', error);
            throw new Error('Erro ao buscar reservas conflitantes.');
        }
    }

}

module.exports = ReservaDAO;