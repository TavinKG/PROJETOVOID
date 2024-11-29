const UsuarioCondominioDAO = require('../dao/UsuarioCondominioDAO'); // DAO para interagir com o banco
const UsuarioCondominio = require('../models/UsuarioCondominio'); // Classe modelo

class UsuarioCondominioController {

  static async criarVinculo(req, res) {
    const { status, usuarioId, condominioId } = req.body;

    try {
      // Cria o objeto UsuarioCondominio
      const usuarioCondominio = new UsuarioCondominio(null, status, usuarioId, condominioId);

      // Chama a DAO para inserir o vínculo no banco
      const vinculoCriado = await UsuarioCondominioDAO.inserirUsuarioCondominio(usuarioCondominio);

      res.status(201).json({
        message: 'Vínculo criado com sucesso!',
        data: vinculoCriado,
      });
    } catch (error) {
      console.error('Erro ao criar vínculo:', error);
      res.status(500).json({ message: 'Erro ao criar vínculo entre usuário e condomínio' });
    }
  }

  static async alterarStatus(req, res) {
    const { usuarioId, condominioId, status } = req.body;
    console.log(usuarioId, condominioId, status);

    try {
      // Chama a DAO para atualizar o status do vínculo
      const vinculoAtualizado = await UsuarioCondominioDAO.alterarStatus(usuarioId, condominioId, status);

      res.status(200).json({
        message: 'Status do vínculo atualizado com sucesso!',
        data: vinculoAtualizado,
      });
    } catch (error) {
      console.error('Erro ao atualizar status do vínculo:', error);
      res.status(500).json({ message: 'Erro ao atualizar status do vínculo' });
    }
  }

  static async listarCondominiosAtivos(req, res) {
    const { userId } = req.params;

    try {
      // Chama a DAO para buscar os condomínios ativos do usuário
      const condominiosAtivos = await UsuarioCondominioDAO.buscarCondominiosAtivos(userId);

      if (!condominiosAtivos.length) {
        return res.status(404).json({ message: 'Nenhum condomínio ativo encontrado para este usuário.' });
      }

      res.status(200).json({
        message: 'Condomínios ativos encontrados com sucesso!',
        data: condominiosAtivos,
      });
    } catch (error) {
      console.error('Erro ao listar condomínios ativos:', error);
      res.status(500).json({ message: 'Erro ao listar condomínios ativos.' });
    }
  }

  static async listarSolicitacoesPendentes(req, res) {
    const { condominioId } = req.params;

    try {
      // Chama a DAO para buscar os condomínios ativos do usuário
      const usuariosPendentes = await UsuarioCondominioDAO.buscarSolicitacoes(condominioId);

      if (!usuariosPendentes.length) {
        return res.status(404).json({ message: 'Nenhum usuário pendente encontrado para este condomínio.' });
      }

      res.status(200).json({
        message: 'Usuários pendente encontrados com sucesso!',
        data: usuariosPendentes,
      });
    } catch (error) {
      console.error('Erro ao listar usuários pendentes:', error);
      res.status(500).json({ message: 'Erro ao listar usuários pendentes.' });
    }
  }
  
}

module.exports = UsuarioCondominioController;
