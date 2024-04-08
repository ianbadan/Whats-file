class HistoricoMensagens{
    constructor(){
        this.historico = []
    }

    adicionar(mensagem){
        this.historico.push(mensagem);
    }

    remover(mensagem){
        this.historico.splice(this.historico.findIndex(item => item.usuario == mensagem.usuario && item.autor == mensagem.autor),1);
        return mensagem
    }

    atualizar(mensagem){
        this.historico[this.historico.findIndex(item => item.usuario == mensagem.usuario && item.autor == mensagem.autor)] = mensagem;
        return mensagem
    }

    obter(usuario, autor){
        return this.historico.find(item => item.usuario == usuario && item.autor == autor);
    }

    existe(usuario, autor){
        return this.historico.some(item => item.usuario == usuario && item.autor == autor)
    }
}

class Mensagem{
    constructor(usuario, autor, etapa, mensagem, lista = [], opcoesExtras = false){
        this.usuario = usuario,
        this.autor = autor,
        this.etapa = etapa,
        this.mensagem = mensagem
        this.opcoesExtras = opcoesExtras
        this.dataHoraMensagem = Date.now();
        this.listaDocumentos = lista;
    }

    adicionarListaDocumentos(lista){
        this.listaDocumentos = lista;
    }
}

module.exports = {
    HistoricoMensagens,
    Mensagem
}
