// dao/AssembleiaDAO.js

const supabase = require('../config/supabase'); // Configuração do Supabase
const Assembleia = require('../models/Assembleia'); // Classe Assembleia

class AssembleiaDAO {

    /**
     * Insere uma nova assembleia no banco de dados.
     * @param {Assembleia} assembleia O objeto Assembleia a ser inserido.
     * @returns {Promise<Array>} Os dados da assembleia inserida.
     */
    static async criarAssembleia(assembleia) {
        const { titulo, dataHora, descricao, condominioId, criadorId } = assembleia;

        const { data, error } = await supabase
            .from('assembleia') // Nome da sua tabela de assembleias
            .insert([{
                titulo: titulo,
                data_hora: dataHora,
                descricao: descricao,
                condominio_id: condominioId,
                criador_id: criadorId
            }])
            .select(); // Retorna os dados inseridos

        if (error) {
            console.error('Erro Supabase ao criar assembleia:', error);
            throw new Error(`Erro ao criar assembleia: ${error.message}`);
        }

        console.log("Assembleia criada com sucesso:", data);
        return data; // Retorna os dados inseridos
    }

    /**
     * Lista todas as assembleias de um condomínio específico.
     * Pode incluir filtros e ordenação.
     * @param {number} condominioId O ID do condomínio.
     * @returns {Promise<Array>} Um array de objetos de assembleia.
     */
    static async listarAssembleiasPorCondominio(condominioId) {
        try {
            const { data, error } = await supabase
                .from('assembleia')
                .select(`
                    id,
                    titulo,
                    data_hora,
                    descricao,
                    condominio_id,
                    criador_id,
                    criado_em,
                    criador:usuario!fk_criador(id, nome, email) -- CORREÇÃO AQUI: Especifique o nome da FK
                `) // Popula dados do usuário criador
                .eq('condominio_id', condominioId)
                .order('data_hora', { ascending: true });

            if (error) {
                console.error('Erro Supabase ao listar assembleias por condomínio:', error);
                throw new Error(`Erro ao listar assembleias: ${error.message}`);
            }

            const assembleiasFormatadas = data.map(assembleia => ({
                ...assembleia,
                criador: assembleia.criador || null
            }));

            return assembleiasFormatadas;
        } catch (error) {
            console.error('Erro na DAO ao listar assembleias por condomínio:', error);
            throw new Error('Erro ao listar assembleias do condomínio.');
        }
    }

    /**
     * Registra a confirmação de presença de um usuário em uma assembleia.
     * @param {number} assembleiaId O ID da assembleia.
     * @param {string} usuarioId O ID do usuário que confirmou presença.
     * @returns {Promise<Array>} Os dados da confirmação de presença.
     */
    static async confirmarPresenca(assembleiaId, usuarioId) {
        // Assume que você tem uma tabela `assembleia_participantes`
        // com colunas `assembleia_id` e `usuario_id`
        const { data, error } = await supabase
            .from('assembleia_participantes') // <--- VERIFIQUE O NOME DESTA TABELA NO SEU BANCO
            .insert([{
                assembleia_id: assembleiaId,
                usuario_id: usuarioId
            }])
            .select();

        if (error) {
            // Se já existe, pode ser um erro de UNIQUE_VIOLATION
            if (error.code === '23505') { // PostgreSQL: unique_violation
                console.warn(`Presença já confirmada para usuário ${usuarioId} na assembleia ${assembleiaId}`);
                // Não lança erro, apenas retorna um indicador de que já existe
                return { exists: true }; 
            }
            console.error('Erro Supabase ao confirmar presença:', error);
            throw new Error(`Erro ao confirmar presença: ${error.message}`);
        }

        console.log("Presença confirmada com sucesso:", data);
        return data;
    }

    /**
     * Verifica se um usuário já confirmou presença em uma assembleia.
     * @param {number} assembleiaId O ID da assembleia.
     * @param {string} usuarioId O ID do usuário.
     * @returns {Promise<boolean>} True se confirmou, False caso contrário.
     */
    static async verificarPresenca(assembleiaId, usuarioId) {
        const { data, error } = await supabase
            .from('assembleia_participantes')
            .select('assembleia_id, usuario_id') // CORREÇÃO AQUI: Seleciona as colunas da PK composta
            .eq('assembleia_id', assembleiaId)
            .eq('usuario_id', usuarioId);

        if (error) {
            console.error('Erro Supabase ao verificar presença:', error);
            throw new Error(`Erro ao verificar presença: ${error.message}`);
        }

        return data.length > 0; // Se houver algum registro, significa que a presença foi confirmada
    }

    /**
     * Lista todas as assembleias de um condomínio específico,
     * incluindo se um dado usuário (opcional) confirmou presença.
     * @param {number} condominioId O ID do condomínio.
     * @param {string} currentUserId O ID do usuário logado para verificar a presença.
     * @returns {Promise<Array>} Um array de objetos de assembleia.
     */
    static async listarAssembleiasPorCondominio(condominioId, currentUserId = null) { // NOVO: currentUserId como parâmetro
        try {
            let query = supabase
                .from('assembleia')
                .select(`
                    id,
                    titulo,
                    data_hora,
                    descricao,
                    condominio_id,
                    criador_id,
                    criado_em,
                    criador:usuario!fk_criador(id, nome, email)
                `)
                .eq('condominio_id', condominioId)
                .order('data_hora', { ascending: true });

            const { data, error } = await query;

            if (error) {
                console.error('Erro Supabase ao listar assembleias por condomínio:', error);
                throw new Error(`Erro ao listar assembleias: ${error.message}`);
            }

            // NOVO: Verificar presença para cada assembleia se currentUserId foi fornecido
            const assembleiasFormatadas = await Promise.all(data.map(async (assembleia) => {
                let حضور_confirmed = false;
                if (currentUserId) {
                    // Reutiliza o método verificarPresenca para cada assembleia
                    حضور_confirmed = await AssembleiaDAO.verificarPresenca(assembleia.id, currentUserId);
                }
                return {
                    ...assembleia,
                    criador: assembleia.criador || null,
                    presencaConfirmada: حضور_confirmed // NOVO: Adiciona esta flag
                };
            }));

            return assembleiasFormatadas;
        } catch (error) {
            console.error('Erro na DAO ao listar assembleias por condomínio:', error);
            throw new Error('Erro ao listar assembleias do condomínio.');
        }
    }

}

module.exports = AssembleiaDAO;