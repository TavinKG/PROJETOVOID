// models/Foto.js

class Foto {
    constructor(id, url, descricao, galeriaId, usuarioId, status = 'aprovada') { // status padrão 'aprovada'
        this.id = id;
        this.url = url; // URL pública da imagem no Supabase Storage
        this.descricao = descricao; // Descrição da foto (opcional)
        this.galeriaId = galeriaId; // FK para Galeria
        this.usuarioId = usuarioId; // FK para Usuário (quem fez o upload)
        this.status = status; // 'pendente', 'aprovada', 'rejeitada' (se houver moderação)
        // criado_em será gerado pelo banco
    }
}

module.exports = Foto;