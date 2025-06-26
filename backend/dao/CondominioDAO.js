const supabase = require('../config/supabase');

class CondominioDAO {
  static async createCondominio(condominio) {
    const { nome, cnpj, endereco } = condominio;

    const { data, error } = await supabase
      .from('condominio')
      .insert([{ nome, cnpj, endereco }])
      .select();

    if (error) throw new Error(error.message);

    console.log("Condomínio criado com sucesso:", data);
    return data;
  }

  static async createAreasComuns(condominioId, areasComuns) {
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
    return data;
  }

  static async buscarPorCNPJ(cnpj) {
    const { data, error } = await supabase
      .from('condominio')
      .select('*')
      .eq('cnpj', cnpj)
      .single();

    if (error) throw new Error(`Erro ao buscar condomínio: ${error.message}`);
    return data;
  }

  static async getCondominioById(id) {
      const { data, error } = await supabase
          .from('condominio')
          .select('*')
          .eq('id', id)
          .single();

      if (error) {
          if (error.code === 'PGRST116') {
              return null;
          }
          console.error('Erro Supabase ao buscar condomínio por ID:', error.message);
          throw new Error(`Erro ao buscar condomínio: ${error.message}`);
      }
      return data;
  }

  static async updateCondominio(id, camposAtualizados) {
    const { data, error } = await supabase
      .from('condominios')
      .update(camposAtualizados)
      .eq('id', id);

    if (error) throw new Error(error.message);

    console.log("Condomínio atualizado com sucesso:", data);
    return data;
  }

  static async deleteCondominio(id) {
    const { data, error } = await supabase
      .from('condominios')
      .delete()
      .eq('id', id);

    if (error) throw new Error("Erro ao deletar o condomínio!");

    console.log("Condomínio deletado com sucesso:", data);
    return data;
  }

  static async getAreasComunsByCondominioId(condominioId) {

        const { data, error } = await supabase
            .from('areas_comuns')
            .select('*')
            .eq('condominio_id', condominioId);

        if (error) {
            console.error('Erro ao buscar áreas comuns no Supabase:', error.message);
            throw new Error(`Erro ao buscar áreas comuns: ${error.message}`);
        }

        return data;
    }
}

module.exports = CondominioDAO;
