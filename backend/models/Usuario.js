class Usuario {
    constructor(id, nome, email, senha, cpf, dataNascimento, telefone, tipoUsuario) {
      this.id = id;
      this.nome = nome;
      this.email = email;
      this.senha = senha;
      this.cpf = cpf;
      this.dataNascimento = dataNascimento;
      this.telefone = telefone;
      this.tipoUsuario = tipoUsuario;
    }
  }
  
module.exports = Usuario;
  