
const supabase = require('../config/supabase');
const Galeria = require('../models/Galeria');

class GaleriaDAO {

    /**
     * Insere uma nova galeria no banco de dados.
     * @param {Galeria} galeria O objeto Galeria a ser inserido.
     * @returns {Promise<Array>} Os dados da galeria inserida.
     */
    static async criarGaleria(galeria) {
        const { nome, condominioId, criadorId, fotoCapaUrl } = galeria;

        const { data, error } = await supabase
            .from('galeria')
            .insert([{
                nome: nome,
                condominio_id: condominioId,
                criador_id: criadorId,
                foto_capa_url: fotoCapaUrl
            }])
            .select();

        if (error) {
            console.error('Erro Supabase ao criar galeria:', error);
            throw new Error(`Erro ao criar galeria: ${error.message}`);
        }

        console.log("Galeria criada com sucesso:", data);
        return data;
    }

    /**
     * Lista todas as galerias de um condomínio específico.
     * @param {number} condominioId O ID do condomínio.
     * @returns {Promise<Array>} Um array de objetos de galeria.
     */
    static async listarGaleriasPorCondominio(condominioId) {
        try {
            const { data, error } = await supabase
                .from('galeria')
                .select(`
                    id,
                    nome,
                    condominio_id,
                    criador_id,
                    foto_capa_url,
                    criado_em,
                    criador:usuario(nome, email) // Popula dados do usuário criador
                `)
                .eq('condominio_id', condominioId)
                .order('criado_em', { ascending: false });

            if (error) {
                console.error('Erro Supabase ao listar galerias por condomínio:', error);
                throw new Error(`Erro ao listar galerias: ${error.message}`);
            }

            const galeriasFormatadas = data.map(galeria => ({
                ...galeria,
                criador: galeria.criador || null
            }));

            return galeriasFormatadas;
        } catch (error) {
            console.error('Erro na DAO ao listar galerias por condomínio:', error);
            throw new Error('Erro ao listar galerias do condomínio.');
        }
    }

    static async buscarUltimaFotoGaleria(galeriaId) {
        try {
            const { data, error } = await supabase
                .from('foto')
                .select('id, url')
                .eq('galeria_id', galeriaId)
                .eq('status', 'aprovada')
                .order('id', { ascending: false })
                .limit(1)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    return null;
                }
                console.error('Erro Supabase ao buscar última foto da galeria:', error.message);
                throw new Error(`Erro ao buscar última foto da galeria: ${error.message}`);
            }

            return data;
        } catch (error) {
            console.error('Erro na DAO ao buscar última foto da galeria:', error);
            throw new Error('Erro ao buscar última foto da galeria.');
        }
    }

    static async atualizarFotoCapaGaleria(galeriaId, fotoCapaUrl) {
        try {
            const { data, error } = await supabase
                .from('galeria')
                .update({ foto_capa_url: fotoCapaUrl })
                .eq('id', galeriaId)
                .select();

            if (error) {
                console.error('Erro Supabase ao atualizar foto de capa da galeria:', error);
                throw new Error(`Erro ao atualizar foto de capa da galeria: ${error.message}`);
            }

            console.log(`Foto de capa da galeria ${galeriaId} atualizada para: ${fotoCapaUrl}`);
            return data;
        } catch (error) {
            console.error('Erro na DAO ao atualizar foto de capa da galeria:', error);
            throw new Error('Erro ao atualizar foto de capa da galeria.');
        }
    }
}

module.exports = GaleriaDAO;