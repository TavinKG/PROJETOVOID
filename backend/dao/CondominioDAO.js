const supabase = require('../config/supabase');

class CondominioDAO {
  // Função para criar um novo condomínio
  static async createCondominio(condominio) {
    const { nome, cnpj, endereco } = condominio;

    // Inserindo o registro na tabela "condominio"
    const { data, error } = await supabase
      .from('condominio')
      .insert([{ nome, cnpj, endereco }])
      .select();

    if (error) throw new Error(error.message);

    console.log("Condomínio criado com sucesso:", data);
    return data; // Retorna os dados inseridos
  }

  // Função para criar áreas comuns associadas ao condomínio
  static async createAreasComuns(condominioId, areasComuns) {
    // Mapear as áreas comuns para o formato esperado pela tabela
    const areasData = areasComuns.map(area => ({
      nome: area.nome,
      disponibilidade: area.disponibilidade,
      condominio_id: condominioId,
    }));

    const { data, error } = await supabase
      .from('areas_comuns')
      .insert(areasData)
      .select();

    if (error) throw new Error(error.message);

    console.log("Áreas comuns associadas ao condomínio com sucesso:", data);
    return data; // Retorna os dados das áreas comuns inseridas
  }

  static async buscarPorCNPJ(cnpj) {
    const { data, error } = await supabase
      .from('condominio')
      .select('*')
      .eq('cnpj', cnpj)
      .single(); // Retorna um único registro

    if (error) throw new Error(`Erro ao buscar condomínio: ${error.message}`);
    return data;
  }

  // Função para buscar um condomínio por ID
  static async getCondominioById(id) {
    const { data, error } = await supabase
      .from('condominios')
      .select('*')
      .eq('id', id)
      .single(); // Usando .single() para garantir que retorne no máximo 1 resultado

    if (error) throw new Error("Condomínio não encontrado!");

    return data; // Retorna os dados do condomínio
  }

  // Função para atualizar os dados de um condomínio
  static async updateCondominio(id, camposAtualizados) {
    const { data, error } = await supabase
      .from('condominios')
      .update(camposAtualizados) // Os campos que precisam ser atualizados
      .eq('id', id);

    if (error) throw new Error(error.message);

    console.log("Condomínio atualizado com sucesso:", data);
    return data; // Retorna os dados atualizados
  }

  // Função para deletar um condomínio
  static async deleteCondominio(id) {
    const { data, error } = await supabase
      .from('condominios')
      .delete()
      .eq('id', id);

    if (error) throw new Error("Erro ao deletar o condomínio!");

    console.log("Condomínio deletado com sucesso:", data);
    return data; // Retorna os dados do condomínio deletado
  }
}

module.exports = CondominioDAO;
