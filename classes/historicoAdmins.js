class HistoricoAdmins{
    constructor(){
        this.historico = []
    }

    adicionar(admin){
        this.historico.push(admin);
    }

    remover(admin){
        this.historico.splice(this.historico.findIndex(item => item == admin ),1);
        return mensagem
    }

    obter(admin){
        return this.historico.find(item => item == admin);
    }

    existe(admin){
        return this.historico.some(item => item == admin)
    }
}

module.exports = {
    HistoricoAdmins
}