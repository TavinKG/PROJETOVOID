const supabase = require('../config/supabase');
const Morador = require('../models/Morador');  // Importando a classe Morador
const UsuarioDAO = require('./UsuarioDAO');  // Importando a classe UsuarioDAO para reutilizar os métodos

class MoradorDAO extends UsuarioDAO {

  // Função para associar dados residenciais ao morador (apartamento, blocoTorre, condominioId)
  static async insertDadosResidenciais(usuarioId, apartamento, blocoTorre, condominioId) {
    // Atualiza os dados residenciais do morador
    const { data, error } = await supabase
      .from('morador')
      .insert([{ apartamento, bloco_torre: blocoTorre, condominio_id: condominioId, usuario_id: usuarioId }])
      .select();

    if (error) throw new Error("Erro ao associar dados residenciais ao morador!");

    console.log("Dados residenciais associados com sucesso:", data);
    return data; // Retorna os dados residenciais do morador
  }

  // Sobrescrevendo a função getUsuarioById para buscar o morador
  static async getMoradorById(id) {
    // Primeiro buscamos o usuário
    const usuarioData = await UsuarioDAO.getUsuarioById(id);

    // Agora buscamos os dados do morador associados ao usuário
    const { data, error } = await supabase
      .from('morador')
      .select('*')
      .eq('usuario_id', id)
      .single();  // Garantimos que só um registro seja retornado

    if (error) throw new Error("Morador não encontrado!");

    // Retorna os dados do morador com os dados do usuário
    return { ...usuarioData, apartamento: data.apartamento, blocoTorre: data.bloco_torre, condominioId: data.condominio_id }; // Mescla os dados do morador e usuário
  }

  // Sobrescrevendo a função updateUsuario para atualizar os dados do morador
  static async updateMorador(id, camposAtualizados) {
    // Atualizando o usuário
    const usuarioData = await UsuarioDAO.updateUsuario(id, camposAtualizados);

    // Se houver a chave 'apartamento', 'blocoTorre' ou 'condominioId' nos camposAtualizados, atualiza a tabela Morador
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

    // Retorna os dados atualizados do usuário
    return usuarioData;
  }

  // Sobrescrevendo a função deleteUsuario para excluir o morador e o usuário
  static async deleteMorador(id) {
    // Primeiro, vamos excluir o morador
    const { data, error } = await supabase
      .from('morador')
      .delete()
      .eq('usuario_id', id);

    if (error) throw new Error("Erro ao deletar o morador!");

    console.log("Morador deletado com sucesso:", data);

    // Agora, excluímos o usuário associado
    return await UsuarioDAO.deleteUsuario(id);
  }
}

module.exports = MoradorDAO;
