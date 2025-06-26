
class Foto {
    constructor(id, url, descricao, galeriaId, usuarioId, status = 'aprovada') {
        this.id = id;
        this.url = url;
        this.descricao = descricao;
        this.galeriaId = galeriaId;
        this.usuarioId = usuarioId;
        this.status = status;
    }
}

module.exports = Foto;