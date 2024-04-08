
const MensagensSistemas = {
    COMO_POSSO_AJUDAR : "*Olá, como posso te ajudar?*\n",
    OPCOES_PRIMEIRO_CONTATO :  "1 - Pesquisar por arquivo\n",
    OPCOES_PRIMEIRO_CONTATO_ADMIN :  "2 - Enviar novo arquivo\n3 - Remover arquivo\n",
    OPCAO_REPETIR_ENVIO_ARQUIVO: "\nCaso queira enviar outro arquivo.\n",
    OPCAO_REPETIR_BUSCA_ARQUIVO: "\nCaso queira buscar outro arquivo.\n",
    OPCAO_REPETIR_REMOVER_ARQUIVO: "\nCaso queira remover outro arquivo.\n",
    OPCAO_VOLTAR_MENU_INICIAL: "\n*0* - Voltar ao menu inicial",
    OPCAO_ENCERRAR_CONVERSA: "\n*0* - Encerrar conversa",
    OBTER_DADOS_ARQUIVO:  "Informe as palavras chaves do arquivo que deseja pesquisar:\n",
    LISTA_ARQUIVOS: "Os arquivos encontrados com a descrição informada foram:\n",
    DADOS_ENVIO_ARQUIVO: "Envie o arquivo com as seguintes informações na descrição:\n*Nome:*\n*Descricao:*\n*Categoria:*\n",
    SUCESSO_ARQUIVO_REMOVIDO: "Arquivo removido com sucesso\n",
    SUCESSO_ARQUIVO_SALVO: "Arquivo salvo com sucesso\n",
    ERRO_ARQUIVOS_NAO_ENCONTRADOS_BANCO: "Não foram encotrados arquivos com a descrição informada.\n",
    ERRO_NAO_IMPLEMENTADO : "Opção não implementada até o momento!\n",
    ERRO_OPCAO_NAO_ENCONTRADA : "Opção não encontrada, tente novamente!\n",
    ERRO_ARQUIVO_NAO_ENCONTRADO: "Arquivo não enviado, envie o arquivo que será salvo conforme foi solicitado!\n",
    ERRO_DADOS_ARQUIVO_NAO_ENCONTRADO: "Dados do arquivo não foram enviados, envie novamente conforme foi solicitado!\n",
    ERRO_BAIXAR_ARQUIVO: "Não foi possivel baixar o arquivo enviado, por favor, envie novamente!\n",
    ERRO_SALVAR_ARQUIVO_BANCO: "Erro ao salvar o arquivo no banco de dados, contate o administrador!\n",
    ERRO_REMOVER_ARQUIVO_BANCO: "Erro ao remover o arquivo no banco de dados, contate o administrador!\n",
    CONVERSA_SERA_ENCERRADA: "Nossa conversa será encerrada, mas pode me chamar novamente a qualquer momento!\n"
}

const Etapas = {
    MENSAGEM_PRIMEIRO_CONTATO : 0,
    OPCOES_PRIMEIRO_CONTATO : 1,
    OBTER_LISTA_ARQUIVOS : 2,
    RETORNAR_ARQUIVO_SELECIONADO : 3,
    SALVAR_ARQUIVO_ENVIADO : 4,
    OBTER_LISTA_ARQUIVOS_REMOCAO: 5,
    REMOVER_ARQUIVO_SELECIONADO: 6
}

module.exports = {
    MensagensSistemas,
    Etapas
}