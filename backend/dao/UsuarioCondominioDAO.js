const supabase = require('../config/supabase');
const UsuarioCondominio = require('../models/UsuarioCondominio');

class UsuarioCondominioDAO {

  static async inserirUsuarioCondominio(usuarioCondominio) {
    const { status, usuarioId, condominioId } = usuarioCondominio;

    const { data, error } = await supabase
      .from('usuariocondominio')
      .insert([{ status, usuario_id: usuarioId, condominio_id: condominioId }])
      .select();

    if (error) throw new Error(`Erro ao inserir na tabela usuariocondominio: ${error.message}`);

    console.log("Registro inserido com sucesso:", data);
    return data;
  }

  static async alterarStatus(usuarioId, condominioId, novoStatus) {
    const { data, error } = await supabase
      .from('usuariocondominio')
      .update({ status: novoStatus })
      .eq('usuario_id', usuarioId)
      .eq('condominio_id', condominioId);

      console.log(usuarioId, condominioId, novoStatus);

    if (error) throw new Error(`Erro ao atualizar o status: ${error.message}`);

    console.log("Status atualizado com sucesso:", data);
    return data;
  }

  static async buscarCondominiosAtivos(usuarioId) {
    try {
      const { data, error} = await supabase
        .from('usuariocondominio')
        .select('condominio_id')
        .eq('usuario_id', usuarioId)
        .eq('status', 1);

      if (error) throw new Error(`Erro ao buscar vínculos ativos: ${error.message}`);

      if (!data.length) return [];
      console.log(data);

      const condominioIds = data.map(vinculo => vinculo.condominio_id);

      const { data: condominios, error: errorCondominios } = await supabase
        .from('condominio')
        .select('id, nome, cnpj, endereco')
        .in('id', condominioIds);

      if (errorCondominios) throw new Error(`Erro ao buscar dados dos condomínios: ${errorCondominios.message}`);

      console.log(condominios);
      return condominios;
    } catch (error) {
      console.error(error);
      throw new Error('Erro ao buscar condomínios ativos.');
    }
  }
  
  static async buscarSolicitacoes(condominioId){
    try {
      const { data, error} = await supabase
        .from('usuariocondominio')
        .select('usuario_id')
        .eq('condominio_id', condominioId)
        .eq('status', 0);

      if (error) throw new Error(`Erro ao buscar solicitações: ${error.message}`);

      if (!data.length) return [];
      console.log(data);

      const usuariosIds = data.map(vinculo => vinculo.usuario_id);

      const { data: usuarios, error: errorUsuarios } = await supabase
        .from('usuario')
        .select('id, nome, email, cpf, telefone, tipo_usuario')
        .in('id', usuariosIds);

      if (errorUsuarios) throw new Error(`Erro ao buscar solicitaçõess: ${errorCondominios.message}`);

      console.log(usuarios);
      return usuarios;
    } catch (error) {
      console.error(error);
      throw new Error('Erro ao buscar solicitações.');
    }
  }

}

module.exports = UsuarioCondominioDAO;
