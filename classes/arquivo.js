class Arquivo{
    constructor(nome, formato, descricao, categoria, hash){
        this.nome = nome?.trim(),
        this.formato = formato?.trim(),
        this.descricao = descricao?.trim(), 
        this.categoria = categoria?.trim(),
        this.hash = hash
    }
    toString(){
        return `${this.nome} - ${this.descricao} - ${this.categoria}`;
    }
}

module.exports = {
    Arquivo
}