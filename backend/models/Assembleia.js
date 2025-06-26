
class Assembleia {
    constructor(id, titulo, dataHora, descricao, condominioId, criadorId) {
        this.id = id;
        this.titulo = titulo;
        this.dataHora = dataHora;
        this.descricao = descricao;
        this.condominioId = condominioId;
        this.criadorId = criadorId;
    }
}

module.exports = Assembleia;