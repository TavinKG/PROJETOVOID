class Aviso{
    constructor(id, titulo, mensagem, autor, data, condominioId){
        this.id = id;
        this.titulo = titulo;
        this.mensagem = mensagem;
        this.autor = autor;
        this.data = data;
        this.condominioId = condominioId;
    }
}

module.exports = Aviso;