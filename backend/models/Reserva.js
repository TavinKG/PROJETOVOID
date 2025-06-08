class Reserva {
    constructor(id, areaId, usuarioId, dataInicio, dataFim, status, titulo, observacoes) {
        this.id = id;
        this.areaId = areaId;
        this.usuarioId = usuarioId;
        this.dataInicio = dataInicio;
        this.dataFim = dataFim;
        this.status = status; // 0: pendente, 1: aprovada, 2: recusada
        this.titulo = titulo;
        this.observacoes = observacoes;
        // criado_em será inserido pelo banco
    }
}

module.exports = Reserva;