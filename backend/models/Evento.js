
class Evento {
    constructor(id, nome, dataHora, local, descricao, condominioId, criadorId) {
        this.id = id;
        this.nome = nome;
        this.dataHora = dataHora;
        this.local = local;
        this.descricao = descricao;
        this.condominioId = condominioId;
        this.criadorId = criadorId;
    }
}

module.exports = Evento;