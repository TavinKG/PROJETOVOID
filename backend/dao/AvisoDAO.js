const supabase = require('../config/supabase');

class AvisoDAO{

    static async createAviso({ titulo, mensagem, autor, date, condominioId }){

        const { data, error } = await supabase
            .from('aviso')
            .upsert([{ titulo, mensagem, autor, data: date, condominio_id: condominioId }])
            .select();

        if (error) throw new Error(error.message);

        console.log("Aviso criado com sucesso:", data);
        console.log(data);
        return data;
    }

    static async selectById(condominioID) {
        const { data, error } = await supabase
          .from('aviso')
          .select('*, usuario!inner(nome)')
          .eq('condominio_id', condominioID);

        if (error) throw new Error(`Erro ao buscar avisos: ${error.message}`);
        return data;
      }
}

module.exports = AvisoDAO;