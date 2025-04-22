class Aviso{
    constructor(id, titulo, mensagem, autor, date, condominioId){
        this.id = id;
        this.titulo = titulo;
        this.mensagem = mensagem;
        this.autor = autor;
        this.date = date;
        this.condominioId = condominioId;
    }
}

module.exports = Aviso;