const Usuario = require('./Usuario');

class Morador extends Usuario {
    constructor(id, nome, email, senha, cpf, dataNascimento, telefone) {
        super(id, nome, email, senha, cpf, dataNascimento, telefone, "Morador");
    }

    setDadosResidenciais(apartamento, blocoTorre, condominioId) {
        this.apartamento = apartamento;
        this.blocoTorre = blocoTorre;
        this.condominioId = condominioId;
    }
}

module.exports = Morador;
