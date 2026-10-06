/* =========================================================================
   teclado.js - Controlador de teclado
   O mesmo controlador da Aurora-7 (baseado no arquivo do professor), agora
   com as setas para cima/baixo, o ENTER (começar / jogar de novo) e a
   tecla C (mostrar ou esconder os retângulos de colisão).
   ========================================================================= */

// Códigos de teclas - aqui vão todos os que forem necessários
var SETA_ESQUERDA = 37;
var SETA_ACIMA    = 38;
var SETA_DIREITA  = 39;
var SETA_ABAIXO   = 40;
var ESPACO        = 32;
var ENTER         = 13;
var TECLA_C       = 67;

// Tabela usada para traduzir "evento.key" para os mesmos códigos acima
var CODIGOS_DAS_TECLAS = {
   'ArrowLeft' : SETA_ESQUERDA,
   'Left'      : SETA_ESQUERDA,
   'ArrowUp'   : SETA_ACIMA,
   'Up'        : SETA_ACIMA,
   'ArrowRight': SETA_DIREITA,
   'Right'     : SETA_DIREITA,
   'ArrowDown' : SETA_ABAIXO,
   'Down'      : SETA_ABAIXO,
   ' '         : ESPACO,
   'Spacebar'  : ESPACO,
   'Enter'     : ENTER,
   'c'         : TECLA_C,
   'C'         : TECLA_C
};

// Teclas que não devem rolar a página enquanto jogamos
var TECLAS_DO_JOGO = [SETA_ESQUERDA, SETA_ACIMA, SETA_DIREITA, SETA_ABAIXO, ESPACO];

// Descobre o código da tecla funcionando em navegadores novos e antigos
function codigoDaTecla(evento) {
   if (CODIGOS_DAS_TECLAS[evento.key] !== undefined)
      return CODIGOS_DAS_TECLAS[evento.key];
   return evento.keyCode;
}

function Teclado(elemento) {
   this.elemento = elemento;

   // Array de teclas pressionadas
   this.pressionadas = [];

   // Array de teclas disparadas
   this.disparadas = [];

   // Funções de disparo registradas
   this.funcoesDisparo = [];

   var teclado = this;

   elemento.addEventListener('keydown', function(evento) {
      var tecla = codigoDaTecla(evento);  // Tornando mais legível ;)

      if (TECLAS_DO_JOGO.indexOf(tecla) >= 0)
         evento.preventDefault();

      teclado.pressionadas[tecla] = true;

      // Disparar somente se for o primeiro keydown da tecla
      if (teclado.funcoesDisparo[tecla] && !teclado.disparadas[tecla]) {
         teclado.disparadas[tecla] = true;
         teclado.funcoesDisparo[tecla]();
      }
   });

   elemento.addEventListener('keyup', function(evento) {
      var tecla = codigoDaTecla(evento);
      teclado.pressionadas[tecla] = false;
      teclado.disparadas[tecla] = false;
   });
}
Teclado.prototype = {
   pressionada: function(tecla) {
      return this.pressionadas[tecla];
   },
   disparou: function(tecla, callback) {
      this.funcoesDisparo[tecla] = callback;
   }
}
