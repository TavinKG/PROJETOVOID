const Usuario = require('./Usuario');

class Administrador extends Usuario {
    constructor(id, nome, email, senha, cpf, dataNascimento, telefone) {
        super(id, nome, email, senha, cpf, dataNascimento, telefone, "Administrador");
    }
    setDadosAdministrador(funcao, condominioId){
        this.funcao = funcao;
        this.condominioId = condominioId;
    }
}

module.exports = Administrador;
