
class Reserva {
    constructor(id, areaId, usuarioId, dataInicio, dataFim, status, titulo, observacoes, condominioId) {
        this.id = id;
        this.areaId = areaId;
        this.usuarioId = usuarioId;
        this.dataInicio = dataInicio;
        this.dataFim = dataFim;
        this.status = status;
        this.titulo = titulo;
        this.observacoes = observacoes;
        this.condominioId = condominioId;
    }
}

module.exports = Reserva;