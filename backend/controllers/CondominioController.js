const CondominioDAO = require('../dao/CondominioDAO');
const Condominio = require('../models/Condominio');

class CondominioController {
  static async register(req, res) {
    const { nome, cnpj, endereco, areasComuns } = req.body;

    try {
      const condominio = new Condominio(null, nome, cnpj, endereco);
      const condominioData = await CondominioDAO.createCondominio(condominio);
      const condominioId = condominioData[0].id;
      
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

  static async listarAreasComuns(req, res) {
        const { condominioId } = req.params;

        try {
            const areasComuns = await CondominioDAO.getAreasComunsByCondominioId(condominioId);
            
            if (!areasComuns || areasComuns.length === 0) {
                return res.status(404).json({ message: 'Nenhuma área comum encontrada para este condomínio.', areas: [] });
            }

            res.status(200).json({ message: 'Áreas comuns listadas com sucesso!', areas: areasComuns });

        } catch (error) {
            console.error('Erro ao listar áreas comuns:', error);
            res.status(500).json({ message: 'Erro ao listar áreas comuns.', error: error.message });
        }
    }

    static async getCondominioById(req, res) {
        const { id } = req.params;
        try {
            const condominio = await CondominioDAO.getCondominioById(id);
            if (condominio) {
                res.status(200).json(condominio);
            } else {
                res.status(404).json({ message: 'Condomínio não encontrado.' });
            }
        } catch (error) {
            console.error('Erro ao buscar condomínio por ID:', error);
            res.status(500).json({ message: 'Erro ao buscar condomínio.' });
        }
    }
}

module.exports = CondominioController;
