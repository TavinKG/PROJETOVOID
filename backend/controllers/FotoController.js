const FotoDAO = require('../dao/FotoDAO');
const Foto = require('../models/Foto');
const GaleriaDAO = require('../dao/GaleriaDAO');

class FotoController {

    static async uploadFoto(req, res) {
        if (!req.file) {
            return res.status(400).json({ message: 'Nenhum arquivo de imagem foi enviado.' });
        }

        const { descricao, galeria_id, usuario_id, status } = req.body;
        
        if (!galeria_id || !usuario_id) {
            return res.status(400).json({ message: 'ID da galeria e ID do usuário são obrigatórios para o upload da foto.' });
        }
        const fotoStatus = status || 'aprovada';

        try {
            const publicUrl = await FotoDAO.uploadFotoToStorage(req.file, usuario_id);

            const novaFoto = new Foto(
                null,
                publicUrl,
                descricao,
                galeria_id,
                usuario_id,
                fotoStatus
            );

            const fotoCriada = await FotoDAO.criarFoto(novaFoto);

            if (fotoStatus === 'aprovada') {
                const ultimaFotoAprovada = await GaleriaDAO.buscarUltimaFotoGaleria(galeria_id);
                if (ultimaFotoAprovada && ultimaFotoAprovada.id === fotoCriada[0].id) {
                    await GaleriaDAO.atualizarFotoCapaGaleria(galeria_id, publicUrl);
                } else if (!ultimaFotoAprovada) {
                    await GaleriaDAO.atualizarFotoCapaGaleria(galeria_id, publicUrl);
                }
            }


            res.status(201).json({
                message: 'Foto enviada e registrada com sucesso!',
                data: fotoCriada,
                url: publicUrl
            });

        } catch (error) {
            console.error('Erro ao fazer upload da foto:', error);
            res.status(500).json({ message: `Erro ao fazer upload da foto: ${error.message}` });
        }
    }

    static async listarFotos(req, res) {
        const { galeriaId } = req.params;
        const tipoUsuario = req.headers['x-user-type'] || req.query.userType; 

        if (!galeriaId) {
            return res.status(400).json({ message: 'ID da galeria é obrigatório para listar fotos.' });
        }

        try {
            const fotos = await FotoDAO.listarFotosPorGaleria(galeriaId, tipoUsuario); 
            
            if (!fotos || fotos.length === 0) {
                return res.status(200).json({ message: 'Nenhuma foto encontrada para esta galeria.', fotos: [] });
            }

            res.status(200).json({ message: 'Fotos listadas com sucesso!', fotos: fotos });

        } catch (error) {
            console.error('Erro ao listar fotos:', error);
            res.status(500).json({ message: `Erro ao listar fotos: ${error.message}` });
        }
    }

    static async alterarStatusFoto(req, res) {
        const { fotoId } = req.params;
        const { status } = req.body;
        const tipoUsuario = req.headers['x-user-type'];

        if (tipoUsuario !== 'Administrador') {
            return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem moderar fotos.' });
        }

        const statusPermitidos = ['aprovada', 'rejeitada'];
        if (!statusPermitidos.includes(status)) {
            return res.status(400).json({ message: 'Status inválido fornecido. Use "aprovada" ou "rejeitada".' });
        }

        try {
            const fotoAtualizada = await FotoDAO.alterarStatusFoto(fotoId, status);

            if (!fotoAtualizada || fotoAtualizada.length === 0) {
                return res.status(404).json({ message: 'Foto não encontrada ou status não pôde ser atualizado.' });
            }

            if (status === 'aprovada') {
                const galeriaId = fotoAtualizada[0].galeria_id; 
                const ultimaFotoAprovada = await GaleriaDAO.buscarUltimaFotoGaleria(galeriaId);
                if (ultimaFotoAprovada && ultimaFotoAprovada.id === fotoAtualizada[0].id) {
                    await GaleriaDAO.atualizarFotoCapaGaleria(galeriaId, fotoAtualizada[0].url);
                }
            }


            res.status(200).json({ message: 'Status da foto atualizado com sucesso!', data: fotoAtualizada[0] });

        } catch (error) {
            console.error('Erro ao alterar status da foto:', error);
            res.status(500).json({ message: `Erro ao alterar status da foto: ${error.message}` });
        }
    }

}

module.exports = FotoController;