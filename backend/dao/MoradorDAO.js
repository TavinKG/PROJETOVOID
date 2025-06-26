const supabase = require('../config/supabase');
const Morador = require('../models/Morador');
const UsuarioDAO = require('./UsuarioDAO');

class MoradorDAO extends UsuarioDAO {

  static async insertDadosResidenciais(usuarioId, apartamento, blocoTorre, condominioId) {
    const { data, error } = await supabase
      .from('morador')
      .insert([{ apartamento, bloco_torre: blocoTorre, condominio_id: condominioId, usuario_id: usuarioId }])
      .select();

    if (error) throw new Error("Erro ao associar dados residenciais ao morador!");

    console.log("Dados residenciais associados com sucesso:", data);
    return data;
  }

  static async getMoradorById(id) {
    const usuarioData = await UsuarioDAO.getUsuarioById(id);

    const { data, error } = await supabase
      .from('morador')
      .select('*')
      .eq('usuario_id', id)
      .single();

    if (error) throw new Error("Morador não encontrado!");

    return { ...usuarioData, apartamento: data.apartamento, blocoTorre: data.bloco_torre, condominioId: data.condominio_id };
  }

  static async updateMorador(id, camposAtualizados) {
    const usuarioData = await UsuarioDAO.updateUsuario(id, camposAtualizados);

    if (camposAtualizados.apartamento || camposAtualizados.blocoTorre || camposAtualizados.condominioId) {
      const { data, error } = await supabase
        .from('morador')
        .update({
          apartamento: camposAtualizados.apartamento,
          bloco_torre: camposAtualizados.blocoTorre,
          condominio_id: camposAtualizados.condominioId
        })
        .eq('usuario_id', id);

      if (error) throw new Error("Erro ao atualizar os dados residenciais do morador!");

      console.log("Dados residenciais do Morador atualizados com sucesso:", data);
    }

    return usuarioData;
  }

  static async deleteMorador(id) {
    const { data, error } = await supabase
      .from('morador')
      .delete()
      .eq('usuario_id', id);

    if (error) throw new Error("Erro ao deletar o morador!");

    console.log("Morador deletado com sucesso:", data);

    return await UsuarioDAO.deleteUsuario(id);
  }
}

module.exports = MoradorDAO;
