/* =========================================================================
   jogo.js - Montagem da cena (equivale ao script que ficava dentro do
   arquivo "teste-teclado-3.html" do professor)
   ========================================================================= */

// Referências do Canvas
var canvas  = document.getElementById('canvas_aurora');
var context = canvas.getContext('2d');

// Controlador do teclado e motor da animação
var teclado  = new Teclado(document);
var animacao = new Animacao(context);

// Cenário (fundo estrelado)
animacao.definirFundo(new CampoDeEstrelas(context, 90));

// Um sprite pode ler o teclado para saber como se comportar, por que não?
var nave = new Nave(context, teclado, animacao);

// Posição inicial: centralizada na horizontal e na parte de baixo da tela
nave.x = (canvas.width - nave.largura) / 2;
nave.y = canvas.height - 110;
animacao.novoSprite(nave);

// Barra de espaço = disparo
teclado.disparou(ESPACO, function() {
   nave.atirar();
});

animacao.ligar();
