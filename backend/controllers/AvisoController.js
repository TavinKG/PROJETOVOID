const AvisoDAO = require('../dao/AvisoDAO');
const Aviso = require('../models/Aviso');

class AvisoController{
    static async register(req, res) {
        const { titulo, mensagem, autor, date, condominioId } = req.body;
    
        try {
          const aviso = new Aviso(null, titulo, mensagem, autor, date, condominioId);
          const avisoData = await AvisoDAO.createAviso(aviso);
          const avisoId = avisoData[0].id;
              
          res.status(201).json({ message: 'Aviso criado com sucesso!', id: avisoId });
        } catch (error) {
          console.error('Erro ao criar aviso:', error);
          res.status(500).json({ message: 'Erro ao criar aviso' });
        }
      }

      static async listarAvisos(req, res) {
        const { condominioID } = req.params;
    
        try {
          const avisoData = await AvisoDAO.selectById(condominioID);
          console.log(avisoData);
          if (!avisoData.length) {
            return res.status(404).json({ message: 'Nenhum aviso encontrado para este condomínio.' });
          }
              
          res.status(200).json({ 
            message: 'Avisos listados com sucesso!', 
            avisoData, 
          });
        } catch (error) {
          console.error('Erro ao listar avisos:', error);
          res.status(500).json({ message: 'Erro ao listar avisos' });
        }
      }
      
}

module.exports = AvisoController;