
const supabase = require('../config/supabase');
const Foto = require('../models/Foto');

const BUCKET_NAME = 'void-photos'; 

class FotoDAO {

    /**
     * Faz upload de um arquivo para o Supabase Storage.
     * @param {object} file Objeto de arquivo do Multer.
     * @param {string} userId ID do usuário fazendo o upload.
     * @returns {Promise<string>} A URL pública do arquivo.
     */
    static async uploadFotoToStorage(file, userId) {
        try {
            const filePath = `${userId}/${Date.now()}-${file.originalname}`;

            const { data, error } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(filePath, file.buffer, {
                    contentType: file.mimetype,
                    upsert: false
                });

            if (error) {
                console.error('Erro Supabase Storage ao fazer upload:', error);
                throw new Error(`Erro ao fazer upload da foto: ${error.message}`);
            }

            const { data: publicUrlData } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(filePath);

            return publicUrlData.publicUrl;

        } catch (error) {
            console.error('Erro na DAO ao fazer upload da foto para Storage:', error);
            throw new Error(`Erro no upload para o storage: ${error.message}`);
        }
    }

    /**
     * Insere os metadados de uma foto no banco de dados.
     * @param {Foto} foto O objeto Foto a ser inserido.
     * @returns {Promise<Array>} Os dados da foto inserida.
     */
    static async criarFoto(foto) {
        const { url, descricao, galeriaId, usuarioId, status } = foto;

        const { data, error } = await supabase
            .from('foto')
            .insert([{
                url: url,
                descricao: descricao,
                galeria_id: galeriaId,
                usuario_id: usuarioId,
                status: status
            }])
            .select();

        if (error) {
            console.error('Erro Supabase ao criar registro da foto:', error);
            throw new Error(`Erro ao criar registro da foto: ${error.message}`);
        }

        console.log("Registro da foto criado com sucesso:", data);
        return data;
    }

    /**
     * Lista as fotos de uma galeria específica, com filtro opcional por status
     * ou exibição de todas para administradores.
     * @param {number} galeriaId O ID da galeria.
     * @param {string} userRole O tipo de usuário logado ('Morador', 'Administrador').
     * @returns {Promise<Array>} Um array de objetos de foto.
     */
    static async listarFotosPorGaleria(galeriaId, userRole = 'Morador') {
        try {
            let query = supabase
                .from('foto')
                .select(`
                    id,
                    url,
                    descricao,
                    galeria_id,
                    usuario_id,
                    status,
                    criado_em,
                    usuario:usuario(nome, email) // Popula dados do usuário que enviou a foto
                `)
                .eq('galeria_id', galeriaId);

            if (userRole === 'Morador') {
                query = query.eq('status', 'aprovada');
            }

            query = query.order('criado_em', { ascending: false });

            const { data, error } = await query;

            if (error) {
                console.error('Erro Supabase ao listar fotos por galeria:', error);
                throw new Error(`Erro ao listar fotos: ${error.message}`);
            }

            const fotosFormatadas = data.map(foto => ({
                ...foto,
                usuario: foto.usuario || null
            }));

            return fotosFormatadas;
        } catch (error) {
            console.error('Erro na DAO ao listar fotos por galeria:', error);
            throw new Error('Erro ao listar fotos da galeria.');
        }
    }

    /**
     * Altera o status de aprovação de uma foto.
     * @param {number} fotoId O ID da foto.
     * @param {string} novoStatus O novo status ('aprovada', 'rejeitada', 'pendente').
     * @returns {Promise<Array>} Os dados da foto atualizada.
     */
    static async alterarStatusFoto(fotoId, novoStatus) {
        const { data, error } = await supabase
            .from('foto')
            .update({ status: novoStatus })
            .eq('id', fotoId)
            .select();

        if (error) {
            console.error('Erro Supabase ao alterar status da foto:', error);
            throw new Error(`Erro ao alterar status da foto: ${error.message}`);
        }
        return data;
    }

    /**
     * Deleta uma foto do banco de dados e do Storage.
     * @param {number} fotoId O ID da foto.
     * @returns {Promise<void>}
     */
    static async deletarFoto(fotoId) {
        try {
            const { data: fotoData, error: fotoError } = await supabase
                .from('foto')
                .select('url')
                .eq('id', fotoId)
                .single();

            if (fotoError || !fotoData) {
                if (fotoError && fotoError.code === 'PGRST116') {
                    throw new Error('Foto não encontrada no banco de dados.');
                }
                throw new Error(`Erro ao buscar URL da foto para exclusão: ${fotoError?.message || 'Erro desconhecido'}`);
            }

            const photoUrl = fotoData.url;
            const pathSegments = photoUrl.split('/');
            const filePathInStorage = pathSegments.slice(pathSegments.indexOf(BUCKET_NAME) + 1).join('/');

            const { error: storageError } = await supabase.storage
                .from(BUCKET_NAME)
                .remove([filePathInStorage]);

            if (storageError) {
                console.error('Erro Supabase Storage ao deletar arquivo:', storageError);
                throw new Error(`Erro ao deletar arquivo do Storage: ${storageError.message}`);
            }

            const { error: dbError } = await supabase
                .from('foto')
                .delete()
                .eq('id', fotoId);

            if (dbError) {
                console.error('Erro Supabase ao deletar registro da foto:', dbError);
                throw new Error(`Erro ao deletar registro da foto: ${dbError.message}`);
            }

            console.log(`Foto ${fotoId} deletada com sucesso do Storage e BD.`);

        } catch (error) {
            console.error('Erro na DAO ao deletar foto:', error);
            throw new Error(`Erro ao deletar foto: ${error.message}`);
        }
    }
}

module.exports = FotoDAO;