const supabase = require('../config/supabase');
const Usuario = require('../models/Usuario');
const bcrypt = require('bcrypt');

const saltRounds = 10;

class UsuarioDAO {
  static async createUsuario(usuario) {
    const { nome, email, senha, cpf, dataNascimento, telefone, tipoUsuario } = usuario;

    const hashedPassword = await bcrypt.hash(senha, saltRounds);

    const { data, error } = await supabase
      .from('usuario')
      .insert([{ nome, email, senha: hashedPassword, cpf, data_nascimento: dataNascimento, telefone, tipo_usuario: tipoUsuario }])
      .select();

    if (error) throw new Error(error.message);

    console.log("Usuário criado com sucesso:", data);
    return data;
  }

  static async loginUsuario(email, senha) {
    const { data, error } = await supabase
      .from('usuario')
      .select('*')
      .eq('email', email)
      .single();

    if (error) throw new Error("Credenciais inválidas!");

    const passwordMatch = await bcrypt.compare(senha, data.senha);

    if (!passwordMatch) {
        throw new Error("E-mail ou senha incorretos.");
    }

    return data;
  }

  static async getUsuarioById(id) {
    const { data, error } = await supabase
      .from('usuario')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error("Usuário não encontrado!");

    return data;
  }

  static async updateUsuario(id, camposAtualizados) {
    const { data, error } = await supabase
      .from('usuario')
      .update(camposAtualizados)
      .eq('id', id);

    if (error) throw new Error(error.message);

    console.log("Usuário atualizado com sucesso:", data);
    return data;
  }

  static async deleteUsuario(id) {
    const { data, error } = await supabase
      .from('usuario')
      .delete()
      .eq('id', id);

    if (error) throw new Error("Erro ao deletar o usuário!");

    console.log("Usuário deletado com sucesso:", data);
    return data;
  }
}

module.exports = UsuarioDAO;