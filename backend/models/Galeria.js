
class Galeria {
    constructor(id, nome, condominioId, criadorId, fotoCapaUrl = null) {
        this.id = id;
        this.nome = nome;
        this.condominioId = condominioId;
        this.criadorId = criadorId;
        this.fotoCapaUrl = fotoCapaUrl;
    }
}

module.exports = Galeria;