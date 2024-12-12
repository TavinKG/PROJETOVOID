const supabase = require('../config/supabase');

class AvisoDAO{

    static async createAviso(aviso){
        const { titulo, mensagem, autor, data, condominioId } = aviso;

        const { dt, error } = await supabase
            .from('aviso')
            .insert([{ titulo, mensagem, autor, data, condominio_id: condominioId }])
            .select();

        if (error) throw new Error(error.message);

        console.log("Aviso criado com sucesso:", dt);
        return dt;
    }
}

module.exports = AvisoDAO;