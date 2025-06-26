const supabase = require('../config/supabase');
const Usuario = require('../models/Usuario'); // Importando a classe Usuario, se necessário
const bcrypt = require('bcrypt');

const saltRounds = 10;

class UsuarioDAO {
  // Função para criar um novo usuário
  static async createUsuario(usuario) {
    // Atributos passados no objeto `usuario`
    const { nome, email, senha, cpf, dataNascimento, telefone, tipoUsuario } = usuario;

    const hashedPassword = await bcrypt.hash(senha, saltRounds);

    // Inserindo o registro na tabela "Usuario"
    const { data, error } = await supabase
      .from('usuario')
      .insert([{ nome, email, senha: hashedPassword, cpf, data_nascimento: dataNascimento, telefone, tipo_usuario: tipoUsuario }])
      .select();

    if (error) throw new Error(error.message);

    console.log("Usuário criado com sucesso:", data);
    return data; // Retorna os dados inseridos
  }

  // Função para login
  static async loginUsuario(email, senha) {
    // Valida se o usuário existe e a senha está correta
    const { data, error } = await supabase
      .from('usuario')
      .select('*')
      .eq('email', email)
      .single(); // Usando .single() para garantir que retorne no máximo 1 resultado

    if (error) throw new Error("Credenciais inválidas!");

    const passwordMatch = await bcrypt.compare(senha, data.senha);

    if (!passwordMatch) {
        throw new Error("E-mail ou senha incorretos."); // Senha não corresponde ao hash
    }

    return data; // Retorna os dados do usuário autenticado
  }

  // Função para buscar um usuário por ID
  static async getUsuarioById(id) {
    const { data, error } = await supabase
      .from('usuario')
      .select('*')
      .eq('id', id)
      .single(); // Usando .single() para garantir que retorne no máximo 1 resultado

    if (error) throw new Error("Usuário não encontrado!");

    return data; // Retorna os dados do usuário
  }

  // Função para atualizar os dados de um usuário
  static async updateUsuario(id, camposAtualizados) {
    const { data, error } = await supabase
      .from('usuario')
      .update(camposAtualizados) // Os campos que precisam ser atualizados
      .eq('id', id);

    if (error) throw new Error(error.message);

    console.log("Usuário atualizado com sucesso:", data);
    return data; // Retorna os dados atualizados
  }

  // Função para deletar um usuário
  static async deleteUsuario(id) {
    const { data, error } = await supabase
      .from('usuario')
      .delete()
      .eq('id', id);

    if (error) throw new Error("Erro ao deletar o usuário!");

    console.log("Usuário deletado com sucesso:", data);
    return data; // Retorna os dados do usuário deletado
  }
}

module.exports = UsuarioDAO;