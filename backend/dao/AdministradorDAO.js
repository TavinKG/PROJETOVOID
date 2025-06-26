const supabase = require('../config/supabase');
const Administrador = require('../models/Administrador');
const UsuarioDAO = require('./UsuarioDAO');

class AdministradorDAO extends UsuarioDAO {
  static async insertDadosAdministrador(funcao, condominioId, usuarioId) {
    const { data, error } = await supabase
      .from('administrador')
      .insert([{ funcao, condominio_id: condominioId, usuario_id: usuarioId }])
      .select();

    if (error) throw new Error("Erro ao associar dados residenciais ao morador!");

    console.log("Dados residenciais associados com sucesso:", data);
    return data;
  }

  static async getAdministradorById(id) {
    const usuarioData = await UsuarioDAO.getUsuarioById(id);

    const { data, error } = await supabase
      .from('administrador')
      .select('*')
      .eq('usuario_id', id)
      .single();

    if (error) throw new Error("Administrador não encontrado!");

    return { ...usuarioData, funcao: data.funcao };
  }

  static async updateAdministrador(id, camposAtualizados) {
    const usuarioData = await UsuarioDAO.updateUsuario(id, camposAtualizados);

    if (camposAtualizados.funcao) {
      const { data, error } = await supabase
        .from('administrador')
        .update({ funcao: camposAtualizados.funcao })
        .eq('usuario_id', id);

      if (error) throw new Error("Erro ao atualizar o administrador!");

      console.log("Função do Administrador atualizada com sucesso:", data);
    }

    return usuarioData;
  }

  static async deleteAdministrador(id) {
    const { data, error } = await supabase
      .from('administrador')
      .delete()
      .eq('usuario_id', id);

    if (error) throw new Error("Erro ao deletar o administrador!");

    console.log("Administrador deletado com sucesso:", data);

    return await UsuarioDAO.deleteUsuario(id);
  }
}

module.exports = AdministradorDAO;
