class UsuarioCondominio {
    constructor(id, status, usuarioId, condominioId) {
        this.id = id;
        this.status = status;
        this.usuarioId = usuarioId;
        this.condominioId = condominioId;
    }
}

module.exports = UsuarioCondominio;