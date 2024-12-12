const AvisoDAO = require('../dao/AvisoDAO');
const Aviso = require('../models/Aviso');

class AvisoController{
    static async register(req, res) {
        const { titulo, mensagem, autor, data, condominioId } = req.body;
    
        try {
          // Chama a DAO para salvar o condomínio e as áreas comuns
          const aviso = new Aviso(null, titulo, mensagem, autor, data, condominioId);
          const avisoData = await AvisoDAO.createAviso(aviso);
          const avisoId = avisoData[0].id;
              
          res.status(201).json({ message: 'Aviso criado com sucesso!', id: avisoId });
        } catch (error) {
          console.error('Erro ao criar aviso:', error);
          res.status(500).json({ message: 'Erro ao criar aviso' });
        }
      }
}

module.exports = AvisoController;