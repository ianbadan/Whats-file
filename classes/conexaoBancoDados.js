const  { PrismaClient } = require('prisma/prisma-client');

const prisma = new PrismaClient();

async function adicionarArquivo(dadosArquivo){
    const arquivoAdicionado = await prisma.arquivo.create({ data: dadosArquivo })
    console.log("Arquivo adicionado:\n" + arquivoAdicionado);
    return arquivoAdicionado;
}

async function atualizarArquivo(dadosArquivo){
    const arquivoAtualizados = await prisma.arquivo.update({
        where: {
            id : dadosArquivo.id
        },
        data : dadosArquivo
    });
    console.log("Arquivo atualizado:\n" + arquivoAtualizados);
}

async function removerArquivo(hashArquivo){
    const arquivoRemovido = await prisma.arquivo.delete({
        where: {
            hash : hashArquivo
        }
    })
    console.log("Arquivo Removido:\n" + arquivoRemovido);
    return arquivoRemovido;
}

async function obterListaArquivos(descricao){
    const listaArquivos = await prisma.arquivo.findMany({
        where:{
            OR:[{
                    descricao :{
                        contains: descricao
                    },
                },
                {
                    nome: {
                        contains: descricao
                    },
                },
                {
                    categoria: {
                        contains: descricao
                    }
                }
            ]
        }
    })
    return listaArquivos;
}

module.exports = {
    adicionarArquivo,
    atualizarArquivo,
    removerArquivo,
    obterListaArquivos,
}