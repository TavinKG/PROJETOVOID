const supabase = require('../config/supabase');
const Administrador = require('../models/Administrador');  // Importando a classe Administrador
const UsuarioDAO = require('./UsuarioDAO');  // Importando a classe UsuarioDAO para reutilizar os métodos

class AdministradorDAO extends UsuarioDAO {
  static async insertDadosAdministrador(funcao, condominioId, usuarioId) {
    // Atualiza os dados residenciais do morador
    const { data, error } = await supabase
      .from('administrador')
      .insert([{ funcao, condominio_id: condominioId, usuario_id: usuarioId }])
      .select();

    if (error) throw new Error("Erro ao associar dados residenciais ao morador!");

    console.log("Dados residenciais associados com sucesso:", data);
    return data; // Retorna os dados residenciais do morador
  }

  // Sobrescrevendo a função getUsuarioById para buscar o administrador
  static async getAdministradorById(id) {
    // Primeiro buscamos o usuário
    const usuarioData = await UsuarioDAO.getUsuarioById(id);

    // Agora buscamos os dados do administrador associados ao usuário
    const { data, error } = await supabase
      .from('administrador')
      .select('*')
      .eq('usuario_id', id)
      .single();  // Garantimos que só um registro seja retornado

    if (error) throw new Error("Administrador não encontrado!");

    // Retorna os dados do administrador com os dados do usuário
    return { ...usuarioData, funcao: data.funcao }; // Mescla os dados do administrador e usuário
  }

  // Sobrescrevendo a função updateUsuario para incluir o campo 'funcao' para o Administrador
  static async updateAdministrador(id, camposAtualizados) {
    // Atualizando o usuário
    const usuarioData = await UsuarioDAO.updateUsuario(id, camposAtualizados);

    // Se houver a chave 'funcao' nos camposAtualizados, atualiza a tabela Administrador
    if (camposAtualizados.funcao) {
      const { data, error } = await supabase
        .from('administrador')
        .update({ funcao: camposAtualizados.funcao })
        .eq('usuario_id', id);

      if (error) throw new Error("Erro ao atualizar o administrador!");

      console.log("Função do Administrador atualizada com sucesso:", data);
    }

    // Retorna os dados atualizados do usuário
    return usuarioData;
  }

  // Sobrescrevendo a função deleteUsuario para excluir o administrador e o usuário
  static async deleteAdministrador(id) {
    // Primeiro, vamos excluir o administrador
    const { data, error } = await supabase
      .from('administrador')
      .delete()
      .eq('usuario_id', id);

    if (error) throw new Error("Erro ao deletar o administrador!");

    console.log("Administrador deletado com sucesso:", data);

    // Agora, excluímos o usuário associado
    return await UsuarioDAO.deleteUsuario(id);
  }
}

module.exports = AdministradorDAO;
