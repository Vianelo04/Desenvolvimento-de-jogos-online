/* =========================================================================
   jogo.js - Montagem da cena e regras do jogo "Colisão Orbital"

   Onde está cada requisito da atividade:
     1) Sprite com vários retângulos ........ sentinelaFoiAtingida()
                                               (+ sentinela.js e colisor.js)
     2) Objeto que desaparece ao tocar ...... cristalColetado()
                                               (+ cristal.js e tiro.js)
     3) Bolas que mudam de cor .............. criarBolas() (+ bola.js)
     4) Contador e Game Over ................ bolasColidiram() e gameOver()
   ========================================================================= */

// Referências do Canvas
var canvas  = document.getElementById('canvas_colisao');
var context = canvas.getContext('2d');

var LIMITE_DE_COLISOES = 3;   // na 3ª colisão entre as bolas: Game Over

// Estes objetos duram a página inteira
var teclado = new Teclado(document);
var fundo   = new CampoDeEstrelas(context, 110);
var mostrarRetangulos = true;

// Estes são recriados a cada partida
var animacao, colisor, painel, placar;
var nave, sentinela, bolaAlfa, bolaBeta;

// -------------------------------------------------------------------------
// Controle das teclas
// -------------------------------------------------------------------------
teclado.disparou(ESPACO, function() {
   if (placar.estado == 'jogando') nave.atirar();
});

teclado.disparou(ENTER, function() {
   // Começar (tela inicial) ou jogar de novo (depois do Game Over)
   if (placar.estado != 'jogando') iniciarJogo();
});

teclado.disparou(TECLA_C, function() {
   if (placar.estado != 'jogando') return;
   mostrarRetangulos = ! mostrarRetangulos;
   painel.mostrarRetangulos = mostrarRetangulos;
});

mostrarTelaInicial();

// -------------------------------------------------------------------------
// Início e montagem da partida
// -------------------------------------------------------------------------
function novoPlacar(estado) {
   return {
      estado: estado,              // 'inicio', 'jogando' ou 'fim'
      pontos: 0,
      cristais: 0,
      ultimaParte: null,           // última parte da Sentinela atingida
      colisoesDasBolas: 0,         // CONTADOR do requisito 4
      limiteDeColisoes: LIMITE_DE_COLISOES
   };
}

function mostrarTelaInicial() {
   placar   = novoPlacar('inicio');
   animacao = new Animacao(context);
   animacao.definirFundo(fundo);
   painel = new Painel(context, placar);
   animacao.definirPainel(painel);
   animacao.ligar();
}

function iniciarJogo() {
   // Desliga a animação anterior (tela inicial ou partida encerrada)
   animacao.desligar();

   placar   = novoPlacar('jogando');
   animacao = new Animacao(context);
   colisor  = new Colisor();
   animacao.novoProcessamento(colisor);
   animacao.definirFundo(fundo);

   criarSentinela();
   criarBolas();
   criarNave();
   criarCristal();

   painel = new Painel(context, placar);
   painel.colisor   = colisor;
   painel.sentinela = sentinela;
   painel.mostrarRetangulos = mostrarRetangulos;
   animacao.definirPainel(painel);

   animacao.ligar();
}

function novoSprite(sprite) {
   // Todo sprite do jogo é animado e participa das colisões
   animacao.novoSprite(sprite);
   colisor.novoSprite(sprite);
}

function criarSentinela() {
   sentinela = new Sentinela(context);
   sentinela.x = (canvas.width - sentinela.largura) / 2;
   sentinela.y = ALTURA_DO_PLACAR + 22;
   sentinela.aoSerAtingida = sentinelaFoiAtingida;
   novoSprite(sentinela);
}

function criarBolas() {
   bolaAlfa = new Bola(context);
   bolaAlfa.nome = 'alfa';
   bolaAlfa.raio = 20;
   bolaAlfa.x = 150;
   bolaAlfa.y = 200;
   // A cada colisão a bola passa para a próxima cor da lista (requisito 3)
   bolaAlfa.definirCores(['#3ee8ff', '#7cff6b', '#ffd23e', '#ff4d6d']);

   bolaBeta = new Bola(context);
   bolaBeta.nome = 'beta';
   bolaBeta.raio = 24;
   bolaBeta.x = canvas.width - 150;
   bolaBeta.y = 300;
   bolaBeta.definirCores(['#ff3ea5', '#a66bff', '#ff9a3e', '#ff4d6d']);

   // No começo as bolas se afastam uma da outra na horizontal; a direção
   // vertical é sorteada
   bolaAlfa.velocidadeX = -velocidadeSorteada();
   bolaBeta.velocidadeX =  velocidadeSorteada();

   var bolas = [bolaAlfa, bolaBeta];
   for (var i = 0; i < bolas.length; i++) {
      bolas[i].velocidadeY = (Math.random() < 0.5 ? -1 : 1) * velocidadeSorteada();
      bolas[i].limiteSuperior = ALTURA_DO_PLACAR;
      bolas[i].aoBaterEmBola = bolasColidiram;
      novoSprite(bolas[i]);
   }
}

function velocidadeSorteada() {
   return 2.2 + Math.random() * 1.2;
}

function criarNave() {
   nave = new Nave(context, teclado, animacao, colisor);
   nave.x = (canvas.width - nave.largura) / 2;
   nave.y = canvas.height - nave.altura - 24;
   nave.limiteSuperior = 230;
   novoSprite(nave);
}

function criarCristal() {
   var cristal = new Cristal(context, animacao, colisor);
   var centroX = nave.x + nave.largura / 2;
   var centroY = nave.y + nave.altura / 2;

   // Sorteia uma posição na área da nave, mas não em cima dela
   var tentativas = 0;
   do {
      cristal.x = 40 + Math.random() * (canvas.width - 80);
      cristal.y = 250 + Math.random() * (canvas.height - 290);
      tentativas++;
   } while (Math.abs(cristal.x - centroX) + Math.abs(cristal.y - centroY) < 180 &&
            tentativas < 30);

   cristal.aoSerColetado = cristalColetado;
   novoSprite(cristal);
}

// -------------------------------------------------------------------------
// Regras do jogo (respostas às colisões)
// -------------------------------------------------------------------------

// REQUISITO 1: a Sentinela diz QUAL dos seus retângulos o laser atingiu
function sentinelaFoiAtingida(parte, tiro) {
   placar.pontos += parte.pontos;
   placar.ultimaParte = parte;

   var topoDoLaser = tiro.y - tiro.comprimento;
   animacao.novoSprite(new Onda(context, animacao, tiro.x, topoDoLaser, '#ffd23e'));
   animacao.novoSprite(new TextoFlutuante(context, animacao, tiro.x, topoDoLaser + 30,
                                          parte.rotulo + ' +' + parte.pontos, '#ffd23e'));
}

// REQUISITO 2: a nave tocou o cristal e ele sumiu da tela
function cristalColetado(cristal) {
   placar.cristais++;
   placar.pontos += 15;

   animacao.novoSprite(new Onda(context, animacao, cristal.x, cristal.y, '#ffd23e'));
   animacao.novoSprite(new TextoFlutuante(context, animacao, cristal.x, cristal.y - 18,
                                          'CRISTAL +15', '#ffd23e'));

   // Outro cristal surge em outro lugar
   criarCristal();
}

// REQUISITOS 3 e 4: as bolas colidiram (as duas já mudaram de cor)
function bolasColidiram(bola1, bola2) {
   placar.colisoesDasBolas++;

   // Ponto de contato entre as duas bolas
   var t = bola1.raio / (bola1.raio + bola2.raio);
   var contatoX = bola1.x + (bola2.x - bola1.x) * t;
   var contatoY = bola1.y + (bola2.y - bola1.y) * t;

   animacao.novoSprite(new Onda(context, animacao, contatoX, contatoY, bola1.cor));
   animacao.novoSprite(new Onda(context, animacao, contatoX, contatoY, bola2.cor));
   animacao.novoSprite(new TextoFlutuante(context, animacao, contatoX, contatoY - 30,
      'COLISÃO ' + placar.colisoesDasBolas + '/' + LIMITE_DE_COLISOES, '#ff4d6d'));

   if (placar.colisoesDasBolas >= LIMITE_DE_COLISOES)
      gameOver();
}

function gameOver() {
   // O painel passa a mostrar "GAME OVER" e a animação é desligada: nada
   // mais se move, colide ou responde às setas e à barra de espaço.
   // Só o ENTER funciona, para começar outra partida.
   placar.estado = 'fim';
   animacao.desligar();
}
