const AreaComum = require('./AreaComum');

class Condominio{
    constructor(id, nome, cnpj, endereco){
        this.id = id;
        this.nome = nome;
        this.cnpj = cnpj;
        this.endereco = endereco;
        this.areasComuns = [];
    }

    adicionarAreaComum(areaComum){
        if (areaComum instanceof AreaComum) {
            this.areasComuns.push(areaComum);
        } else {
            throw new Error("A área comum deve ser uma instância da classe AreaComum.");
        }
    }
}

module.exports = Condominio;