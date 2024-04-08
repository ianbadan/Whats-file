const { Client, MessageMedia, NoAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { MensagensSistemas, Etapas } = require("./classes/mensagensSistema.js");
const { HistoricoMensagens, Mensagem } = require("./classes/historicoMensagens.js");
const { HistoricoAdmins } = require("./classes/historicoAdmins.js");
const { Arquivo } = require("./classes/arquivo.js");
const conexaoBanco = require("./classes/conexaoBancoDados.js");
const fs = require("fs");
const crypto = require("crypto");

const arquivosPath = process.env.FILES_FOLDER_URL;
var comandosInicioGrupo = ["!bot","!estagiário","!café", "!estagiario","!cafe"]
var historicoMensagens;
var historicoAdmins;
const client = new Client({
  authStrategy: new NoAuth(),
  webVersionCache: {
    type: "remote",
    remotePath: "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2411.2.html",
  },
  puppeteer: {
    args: ["--no-sandbox"],
    headless: true,
    //executablePath: '/usr/bin/chromium-browser'
  },
});

client.once("ready", () => {
  historicoMensagens = new HistoricoMensagens();
  historicoAdmins = new HistoricoAdmins();
  client.getChats()
  .then( resp => {
    let listaAdmins = resp.flatMap(item => item.isGroup ? item.participants : null).filter(item => item?.isAdmin == true).flatMap(item => item.id._serialized);
    listaAdmins.forEach(admin => historicoAdmins.adicionar(admin))
    console.log("Whatsapp conectado e pronto para uso!");
  })
  .catch(err => client.close());
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("auth_failure", (message) => {
  console.log(message);
});

client.on('group_admin_changed', (notification) => {
  console.log(notificacao);
});

try {
  client.initialize();
} catch (err) {
  console.log(err);
}

client.on("message", (mensagemRecebida) => {
  try {
    mensagemRecebida.getChat().then((retorno) => {
      if (retorno.isGroup && !comandosInicioGrupo.includes( mensagemRecebida.body.toLocaleLowerCase()) && !historicoMensagens.existe(mensagemRecebida.from, mensagemRecebida.author)) {
        return;
      }

      if (!historicoMensagens.existe(mensagemRecebida.from, mensagemRecebida.author)) {
        historicoMensagens.adicionar(new Mensagem(mensagemRecebida.from, mensagemRecebida.author, Etapas.MENSAGEM_PRIMEIRO_CONTATO, "", null, retorno.isGroup));
      }

      var mensagem = historicoMensagens.obter(mensagemRecebida.from, mensagemRecebida.author);
      mensagem.opcoesExtras = !retorno.isGroup && historicoAdmins.existe(!retorno.isGroup ? mensagemRecebida.from : mensagemRecebida.author);
      obterEtapaUsuario(mensagem, mensagemRecebida);
    });
  } catch (err) {
    console.log(err);
  }
});

function enviarMensagemTexto(mensagemRecebida, novaMensagem, removerHistorico = false) {
  if(removerHistorico)
    historicoMensagens.remover(novaMensagem)
  else
    historicoMensagens.atualizar(novaMensagem);
  mensagemRecebida.reply(novaMensagem.mensagem);
  console.log(`Mensagem de ${mensagemRecebida.from}: ${mensagemRecebida.body}\nResposta: ${novaMensagem.mensagem}\n`);
}

async function enviarMensagemArquivo(mensagemRecebida, novaMensagem, arquivo) {
  historicoMensagens.atualizar(novaMensagem);
  await client.sendMessage(mensagemRecebida.from, MessageMedia.fromFilePath(arquivosPath + `${arquivo.hash}.${arquivo.formato}`), { caption: `*Nome*: ${arquivo.nome}\n*Descricao*: ${arquivo.descricao}\n*Categoria*: ${arquivo.categoria}\n${MensagensSistemas.OPCAO_REPETIR_BUSCA_ARQUIVO}${MensagensSistemas.OBTER_DADOS_ARQUIVO}${MensagensSistemas.OPCAO_VOLTAR_MENU_INICIAL}` });
  console.log(`Mensagem de ${mensagemRecebida.from}: ${mensagemRecebida.body}\nResposta: Arquivo retornado`);
}

function obterEtapaUsuario(ultimoContato, mensagemRecebida) {
  switch (ultimoContato.etapa) {
    case Etapas.OPCOES_PRIMEIRO_CONTATO:
      return OpcoesPrimeiroContato(ultimoContato, mensagemRecebida);
    case Etapas.OBTER_LISTA_ARQUIVOS:
      return ObterListaArquivos(ultimoContato, mensagemRecebida);
    case Etapas.RETORNAR_ARQUIVO_SELECIONADO:
      return RetornarArquivoSelecionado(ultimoContato, mensagemRecebida);
    case Etapas.SALVAR_ARQUIVO_ENVIADO:
      return SalvarArquivoEnviado(ultimoContato, mensagemRecebida);
    case Etapas.OBTER_LISTA_ARQUIVOS_REMOCAO:
      return ObterListaArquivos(ultimoContato, mensagemRecebida, Etapas.REMOVER_ARQUIVO_SELECIONADO);
    case Etapas.REMOVER_ARQUIVO_SELECIONADO:
      return RemoverArquivoSelecionado(ultimoContato, mensagemRecebida);
    default:
      enviarMensagemTexto(mensagemRecebida, new Mensagem(mensagemRecebida.from, mensagemRecebida.author, Etapas.OPCOES_PRIMEIRO_CONTATO, obterMensagemPrimeiroContato(ultimoContato.opcoesExtras), ultimoContato.listaDocumentos));
      break;
  }
}

function OpcoesPrimeiroContato(ultimoContato, mensagemRecebida) {
  let mensagemOpcaoNaoEncontrada = function(){ enviarMensagemTexto(mensagemRecebida, new Mensagem(mensagemRecebida.from, mensagemRecebida.author, ultimoContato.etapa, MensagensSistemas.ERRO_OPCAO_NAO_ENCONTRADA, ultimoContato.listaDocumentos))};

  switch (mensagemRecebida.body) {
    case "0":
      enviarMensagemTexto(mensagemRecebida, new Mensagem(mensagemRecebida.from, mensagemRecebida.author, 0, MensagensSistemas.CONVERSA_SERA_ENCERRADA), true);
      break;
    //Obter Arquivos
    case "1":
      enviarMensagemTexto(mensagemRecebida, new Mensagem(mensagemRecebida.from, mensagemRecebida.author, Etapas.OBTER_LISTA_ARQUIVOS, MensagensSistemas.OBTER_DADOS_ARQUIVO + MensagensSistemas.OPCAO_VOLTAR_MENU_INICIAL));
      break;
    //Salvar Arquivo
    case "2":
      if (!ultimoContato.opcoesExtras){
        mensagemOpcaoNaoEncontrada();        
        return;
      } 
      enviarMensagemTexto(mensagemRecebida, new Mensagem(mensagemRecebida.from, mensagemRecebida.author, Etapas.SALVAR_ARQUIVO_ENVIADO, MensagensSistemas.DADOS_ENVIO_ARQUIVO + MensagensSistemas.OPCAO_VOLTAR_MENU_INICIAL, ultimoContato.listaDocumentos));
      break;
    //Remover Arquivo
    case "3":
      if (!ultimoContato.opcoesExtras){
        mensagemOpcaoNaoEncontrada();     
        return;
      } 
      enviarMensagemTexto(mensagemRecebida, new Mensagem(mensagemRecebida.from, mensagemRecebida.author, Etapas.OBTER_LISTA_ARQUIVOS_REMOCAO, MensagensSistemas.OBTER_DADOS_ARQUIVO, ultimoContato.listaDocumentos));
      break;
    default:
      mensagemOpcaoNaoEncontrada();  
    }
}

async function ObterListaArquivos(ultimoContato, mensagemRecebida, proximaEtapa = Etapas.RETORNAR_ARQUIVO_SELECIONADO) {
  if (mensagemRecebida.body == 0) return enviarMensagemTexto(mensagemRecebida, new Mensagem(mensagemRecebida.from, mensagemRecebida.author, Etapas.OPCOES_PRIMEIRO_CONTATO, obterMensagemPrimeiroContato(ultimoContato.opcoesExtras), ultimoContato.listaDocumentos));

  conexaoBanco
    .obterListaArquivos(mensagemRecebida.body)
    .then((lista) => {
      if (lista == null || lista.length == 0) return enviarMensagemTexto(mensagemRecebida, new Mensagem(mensagemRecebida.from, mensagemRecebida.author, ultimoContato.etapa, MensagensSistemas.ERRO_ARQUIVOS_NAO_ENCONTRADOS_BANCO + MensagensSistemas.OBTER_DADOS_ARQUIVO + MensagensSistemas.OPCAO_VOLTAR_MENU_INICIAL, lista));

      let retorno = MensagensSistemas.LISTA_ARQUIVOS;
      for (i = 0; i < lista.length; i++) {
        retorno += `*${i + 1}* - ${Object.assign(new Arquivo(), lista[i]).toString()}\n`;
      }
      return enviarMensagemTexto(mensagemRecebida, new Mensagem(mensagemRecebida.from, mensagemRecebida.author, proximaEtapa, retorno + MensagensSistemas.OPCAO_VOLTAR_MENU_INICIAL, lista));
    })
    .catch((err) => console.log(err));
}

function RetornarArquivoSelecionado(ultimoContato, mensagemRecebida) {
  if (mensagemRecebida.body == 0) return enviarMensagemTexto(mensagemRecebida, new Mensagem(mensagemRecebida.from, mensagemRecebida.author, Etapas.OPCOES_PRIMEIRO_CONTATO,  obterMensagemPrimeiroContato(ultimoContato.opcoesExtras), ultimoContato.listaDocumentos));

  if (isNaN(mensagemRecebida.body) || mensagemRecebida.body - 1 < 0 || mensagemRecebida.body > ultimoContato.listaDocumentos.length) return enviarMensagemTexto(mensagemRecebida, new Mensagem(mensagemRecebida.from, mensagemRecebida.author, ultimoContato.etapa, MensagensSistemas.ERRO_OPCAO_NAO_ENCONTRADA, ultimoContato.listaDocumentos));

  let arquivoSelecionado = ultimoContato.listaDocumentos[mensagemRecebida.body - 1];
  return enviarMensagemArquivo(mensagemRecebida, new Mensagem(mensagemRecebida.from, mensagemRecebida.author, Etapas.OBTER_LISTA_ARQUIVOS, MensagensSistemas.OPCAO_REPETIR_BUSCA_ARQUIVO + MensagensSistemas.OBTER_DADOS_ARQUIVO + MensagensSistemas.OPCAO_VOLTAR_MENU_INICIAL, ultimoContato.listaDocumentos), arquivoSelecionado);
}

function RemoverArquivoSelecionado(ultimoContato, mensagemRecebida) {
  if (mensagemRecebida.body == 0) return enviarMensagemTexto(mensagemRecebida, new Mensagem(mensagemRecebida.from, mensagemRecebida.author, Etapas.OPCOES_PRIMEIRO_CONTATO,  obterMensagemPrimeiroContato(!ultimoContato.opcoesExtras), ultimoContato.listaDocumentos));

  if (isNaN(mensagemRecebida.body) || mensagemRecebida.body - 1 < 0 || mensagemRecebida.body > ultimoContato.listaDocumentos.length) return enviarMensagemTexto(mensagemRecebida, new Mensagem(mensagemRecebida.from, mensagemRecebida.author, ultimoContato.etapa, MensagensSistemas.ERRO_OPCAO_NAO_ENCONTRADA, ultimoContato.listaDocumentos));

  let arquivoSelecionado = ultimoContato.listaDocumentos[mensagemRecebida.body - 1];
  conexaoBanco
    .removerArquivo(arquivoSelecionado.hash)
    .then((arquivoRemovido) => {
      fs.unlinkSync(arquivosPath + `${arquivoRemovido.hash}.${arquivoRemovido.formato}`);
      return enviarMensagemTexto(mensagemRecebida, new Mensagem(mensagemRecebida.from, mensagemRecebida.author, Etapas.OBTER_LISTA_ARQUIVOS_REMOCAO, MensagensSistemas.SUCESSO_ARQUIVO_REMOVIDO + MensagensSistemas.OPCAO_REPETIR_REMOVER_ARQUIVO + MensagensSistemas.OBTER_DADOS_ARQUIVO + MensagensSistemas.OPCAO_VOLTAR_MENU_INICIAL, ultimoContato.listaDocumentos));
    })
    .catch((err) => {
      console.log(err);
      return enviarMensagemTexto(mensagemRecebida, new Mensagem(mensagemRecebida.from, mensagemRecebida.author, Etapas.MENSAGEM_PRIMEIRO_CONTATO, MensagensSistemas.ERRO_REMOVER_ARQUIVO_BANCO + MensagensSistemas.CONVERSA_SERA_ENCERRADA, ultimoContato.listaDocumentos));
    });
}

async function SalvarArquivoEnviado(ultimoContato, mensagemRecebida) {
  if (mensagemRecebida.body == 0) return enviarMensagemTexto(mensagemRecebida, new Mensagem(mensagemRecebida.from, mensagemRecebida.author, Etapas.OPCOES_PRIMEIRO_CONTATO, obterMensagemPrimeiroContato(ultimoContato.opcoesExtras), ultimoContato.listaDocumentos));

  if (!mensagemRecebida.hasMedia) return enviarMensagemTexto(mensagemRecebida, new Mensagem(mensagemRecebida.from, mensagemRecebida.author, ultimoContato.etapa, MensagensSistemas.ERRO_ARQUIVO_NAO_ENCONTRADO, ultimoContato.listaDocumentos));

  const media = await mensagemRecebida.downloadMedia();
  if (!media) return enviarMensagemTexto(mensagemRecebida, new Mensagem(mensagemRecebida.from, mensagemRecebida.author, ultimoContato.etapa, MensagensSistemas.ERRO_BAIXAR_ARQUIVO, ultimoContato.listaDocumentos));

  var dadosArquivo = Object.fromEntries(
    mensagemRecebida.body
      .replaceAll("*", "")
      .toLowerCase()
      .split("\n")
      .map((item) => item.split(":"))
  );

  if (dadosArquivo.nome == null || dadosArquivo.descricao == null || dadosArquivo.categoria == null) return enviarMensagemTexto(mensagemRecebida, new Mensagem(mensagemRecebida.from, mensagemRecebida.author, ultimoContato.etapa, MensagensSistemas.ERRO_DADOS_ARQUIVO_NAO_ENCONTRADO + MensagensSistemas.OPCAO_VOLTAR_MENU_INICIAL, ultimoContato.listaDocumentos));

  var formato = media.filename == null ? media.mimetype.split("/").slice(-1)[0] : media.filename.split(".").slice(-1)[0];
  var hash = gerarHash256(media.data);
  conexaoBanco
    .adicionarArquivo(new Arquivo(dadosArquivo.nome, formato, dadosArquivo.descricao || dadosArquivo.descrição, dadosArquivo.categoria, hash))
    .then((arquivoAdicionado) => {
      fs.writeFileSync(arquivosPath + `${hash}.${formato}`, Buffer.from(media.data, "base64"));
      return enviarMensagemTexto(mensagemRecebida, new Mensagem(mensagemRecebida.from, mensagemRecebida.author, Etapas.REPETIR_ENVIO_ARQUIVO, MensagensSistemas.SUCESSO_ARQUIVO_SALVO + MensagensSistemas.OPCAO_REPETIR_ENVIO_ARQUIVO + MensagensSistemas.OPCAO_VOLTAR_MENU_INICIAL, ultimoContato.listaDocumentos));
    })
    .catch((err) => {
      console.log(err);
      return enviarMensagemTexto(mensagemRecebida, new Mensagem(mensagemRecebida.from, mensagemRecebida.author, Etapas.MENSAGEM_PRIMEIRO_CONTATO, MensagensSistemas.ERRO_SALVAR_ARQUIVO_BANCO + MensagensSistemas.CONVERSA_SERA_ENCERRADA, ultimoContato.listaDocumentos));
    });
}

function gerarHash256(stringBase64) {
  var hash = crypto.createHash("sha256");
  hash.setEncoding("hex");
  hash.write(stringBase64);
  hash.end();
  return hash.read();
}

function obterMensagemPrimeiroContato(opcoesExtras = false){
  return MensagensSistemas.COMO_POSSO_AJUDAR + MensagensSistemas.OPCOES_PRIMEIRO_CONTATO + (opcoesExtras ? MensagensSistemas.OPCOES_PRIMEIRO_CONTATO_ADMIN : "") + MensagensSistemas.OPCAO_ENCERRAR_CONVERSA
}
