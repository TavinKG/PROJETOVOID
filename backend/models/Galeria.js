// models/Galeria.js

class Galeria {
    constructor(id, nome, condominioId, criadorId, fotoCapaUrl = null) {
        this.id = id;
        this.nome = nome; // Nome do álbum/galeria
        this.condominioId = condominioId; // FK para Condomínio
        this.criadorId = criadorId; // FK para Usuário (Admin que criou a galeria)
        this.fotoCapaUrl = fotoCapaUrl; // URL da foto que representa a capa da galeria (opcional)
        // criado_em será gerado pelo banco
    }
}

module.exports = Galeria;