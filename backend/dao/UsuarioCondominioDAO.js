const supabase = require('../config/supabase'); // Configuração do Supabase
const UsuarioCondominio = require('../models/UsuarioCondominio'); // Classe UsuarioCondominio, se necessário

class UsuarioCondominioDAO {

  static async inserirUsuarioCondominio(usuarioCondominio) {
    const { status, usuarioId, condominioId } = usuarioCondominio;

    // Inserindo o registro na tabela "usuariocondominio"
    const { data, error } = await supabase
      .from('usuariocondominio')
      .insert([{ status, usuario_id: usuarioId, condominio_id: condominioId }])
      .select(); // Retorna os dados inseridos

    if (error) throw new Error(`Erro ao inserir na tabela usuariocondominio: ${error.message}`);

    console.log("Registro inserido com sucesso:", data);
    return data; // Retorna os dados inseridos
  }

  static async alterarStatus(usuarioId, condominioId, novoStatus) {
    // Atualizando o status do registro
    const { data, error } = await supabase
      .from('usuariocondominio')
      .update({ status: novoStatus })
      .eq('usuario_id', usuarioId)
      .eq('condominio_id', condominioId);

      console.log(usuarioId, condominioId, novoStatus);

    if (error) throw new Error(`Erro ao atualizar o status: ${error.message}`);

    console.log("Status atualizado com sucesso:", data);
    return data; // Retorna os dados atualizados
  }

  static async buscarCondominiosAtivos(usuarioId) {
    try {
      // Busca os IDs de condomínios ativos relacionados ao usuário na tabela usuariocondominio
      const { data, error} = await supabase
        .from('usuariocondominio')
        .select('condominio_id')
        .eq('usuario_id', usuarioId)
        .eq('status', 1); // Status 1 indica vínculo ativo

      if (error) throw new Error(`Erro ao buscar vínculos ativos: ${error.message}`);

      if (!data.length) return []; // Retorna vazio se não houver vínculos ativos
      console.log(data);

      const condominioIds = data.map(vinculo => vinculo.condominio_id);

      // Busca os dados dos condomínios na tabela condominio com base nos IDs
      const { data: condominios, error: errorCondominios } = await supabase
        .from('condominio')
        .select('id, nome, cnpj, endereco')
        .in('id', condominioIds);

      if (errorCondominios) throw new Error(`Erro ao buscar dados dos condomínios: ${errorCondominios.message}`);

      console.log(condominios);
      return condominios; // Retorna os dados dos condomínios
    } catch (error) {
      console.error(error);
      throw new Error('Erro ao buscar condomínios ativos.');
    }
  }
  
  static async buscarSolicitacoes(condominioId){
    try {
      // Busca os IDs de condomínios ativos relacionados ao usuário na tabela usuariocondominio
      const { data, error} = await supabase
        .from('usuariocondominio')
        .select('usuario_id')
        .eq('condominio_id', condominioId)
        .eq('status', 0); // Status 1 indica vínculo ativo

      if (error) throw new Error(`Erro ao buscar solicitações: ${error.message}`);

      if (!data.length) return []; // Retorna vazio se não houver vínculos ativos
      console.log(data);

      const usuariosIds = data.map(vinculo => vinculo.usuario_id);

      // Busca os dados dos condomínios na tabela condominio com base nos IDs
      const { data: usuarios, error: errorUsuarios } = await supabase
        .from('usuario')
        .select('id, nome, email, cpf, telefone, tipo_usuario')
        .in('id', usuariosIds);

      if (errorUsuarios) throw new Error(`Erro ao buscar solicitaçõess: ${errorCondominios.message}`);

      console.log(usuarios);
      return usuarios; // Retorna os dados dos condomínios
    } catch (error) {
      console.error(error);
      throw new Error('Erro ao buscar solicitações.');
    }
  }

}

module.exports = UsuarioCondominioDAO;
