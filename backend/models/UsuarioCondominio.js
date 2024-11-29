class UsuarioCondominio {
    constructor(id, status, usuarioId, condominioId) {
        this.id = id; // Identificador único
        this.status = status; // Status do usuário no condomínio
        this.usuarioId = usuarioId; // ID do usuário (chave estrangeira)
        this.condominioId = condominioId; // ID do condomínio (chave estrangeira)
    }
}

module.exports = UsuarioCondominio;