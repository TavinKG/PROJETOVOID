// models/Assembleia.js

class Assembleia {
    constructor(id, titulo, dataHora, descricao, condominioId, criadorId) {
        this.id = id;
        this.titulo = titulo;
        this.dataHora = dataHora; // Data e hora da assembleia
        this.descricao = descricao;
        this.condominioId = condominioId; // ID do condomínio ao qual pertence
        this.criadorId = criadorId; // ID do usuário (administrador) que criou a assembleia
        // A lista de participantes/confirmações de presença não estará no modelo, mas será gerenciada separadamente no banco.
    }
}

module.exports = Assembleia;