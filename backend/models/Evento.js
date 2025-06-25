// models/Evento.js

class Evento {
    constructor(id, nome, dataHora, local, descricao, condominioId, criadorId) {
        this.id = id;
        this.nome = nome; // Título/Nome do evento
        this.dataHora = dataHora; // Data e hora do evento
        this.local = local; // Local do evento (endereço, salão, etc.)
        this.descricao = descricao; // Descrição detalhada do evento
        this.condominioId = condominioId; // ID do condomínio ao qual o evento pertence
        this.criadorId = criadorId; // ID do usuário (administrador) que criou o evento
        // criado_em será gerado pelo banco
    }
}

module.exports = Evento;