const CondominioDAO = require('../dao/CondominioDAO');
const Condominio = require('../models/Condominio');

class CondominioController {
  static async register(req, res) {
    const { nome, cnpj, endereco, areasComuns } = req.body;

    try {
      // Chama a DAO para salvar o condomínio e as áreas comuns
      const condominio = new Condominio(null, nome, cnpj, endereco);
      const condominioData = await CondominioDAO.createCondominio(condominio);
      const condominioId = condominioData[0].id;
      
      // Salva as áreas comuns associadas ao condomínio
      await CondominioDAO.createAreasComuns(condominioId, areasComuns);

      res.status(201).json({ message: 'Condomínio criado com sucesso!', id: condominioId });
    } catch (error) {
      console.error('Erro ao criar condomínio:', error);
      res.status(500).json({ message: 'Erro ao criar condomínio' });
    }
  }

  static async buscarPorCNPJ(req, res) {
    const { cnpj } = req.params;

    try {
      const condominio = await CondominioDAO.buscarPorCNPJ(cnpj);
      if (condominio) {
        res.status(200).json(condominio);
      } else {
        res.status(404).json({ message: 'Condomínio não encontrado.' });
      }
    } catch (error) {
      console.error('Erro ao buscar condomínio:', error);
      res.status(500).json({ message: 'Erro ao buscar condomínio.' });
    }
  }
}

module.exports = CondominioController;
