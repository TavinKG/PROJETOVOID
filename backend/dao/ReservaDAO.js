
const supabase = require('../config/supabase');
const Reserva = require('../models/Reserva');

class ReservaDAO {

    static async criarReserva(reserva) {
        const { areaId, usuarioId, dataInicio, dataFim, status, titulo, observacoes, condominioId } = reserva;

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
                condominio_id: condominioId
            }])
            .select();

        if (error) {
            console.error('Erro Supabase ao criar reserva:', error);
            throw new Error(`Erro ao criar reserva: ${error.message}`);
        }

        console.log("Reserva criada com sucesso:", data);
        return data;
    }

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

            const reservasFormatadas = data.map(reserva => ({
                ...reserva,
                area: reserva.areas_comuns || { nome: 'Nome da Área Indisponível' }
            }));

            return reservasFormatadas;
        } catch (error) {
            console.error('Erro na DAO ao listar reservas por usuário e condomínio:', error);
            throw new Error('Erro ao listar reservas do usuário e condomínio.');
        }
    }

    static async listarTodasReservasPorCondominio(condominioId, filters = {}) {
        let query = supabase
            .from('reservas')
            .select(`
                *,
                areas_comuns(nome),
                usuario(nome, email)
            `)
            .eq('condominio_id', condominioId);

        if (filters.areaId) {
            query = query.eq('area_id', filters.areaId);
        }
        if (filters.status !== undefined && filters.status !== null && filters.status !== '') {
            query = query.eq('status', filters.status);
        }
        if (filters.date) {
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

    static async alterarStatusReserva(reservaId, novoStatus) {
        try {
            const { data, error } = await supabase
                .from('reservas')
                .update({ status: novoStatus })
                .eq('id', reservaId)
                .select();

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
            const startOfDay = `${date}T00:00:00.000Z`;
            const endOfDay = `${date}T23:59:59.999Z`;

            const { data, error } = await supabase
                .from('reservas')
                .select('data_inicio, data_fim, status')
                .eq('area_id', areaId)
                .in('status', ['0', '1'])
                .gte('data_fim', startOfDay)
                .lte('data_inicio', endOfDay);
            
            if (error) {
                console.error('Erro Supabase ao buscar reservas por área e data:', error);
                throw new Error(`Erro ao buscar reservas por área e data: ${error.message}`);
            }
            
            return data;
        } catch (error) {
            console.error('Erro na DAO ao buscar reservas por área e data:', error);
            throw new Error('Erro ao buscar reservas por área e data.');
        }
    }

    static async buscarReservasConflitantes(areaId, dataInicio, dataFim) {
        try {
            const startISO = new Date(dataInicio).toISOString();
            const endISO = new Date(dataFim).toISOString();

            const { data, error } = await supabase
                .from('reservas')
                .select('id, data_inicio, data_fim, status')
                .eq('area_id', areaId)
                .in('status', ['0', '1'])
                .lt('data_inicio', endISO)
                .gt('data_fim', startISO);
            
            if (error) {
                console.error('Erro Supabase ao buscar reservas conflitantes:', error);
                throw new Error(`Erro ao buscar reservas conflitantes: ${error.message}`);
            }

            return data;
        } catch (error) {
            console.error('Erro na DAO ao buscar reservas conflitantes:', error);
            throw new Error('Erro ao buscar reservas conflitantes.');
        }
    }

}

module.exports = ReservaDAO;