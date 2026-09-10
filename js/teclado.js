/* =========================================================================
   teclado.js - Controlador de teclado
   Baseado no arquivo do professor, com duas melhorias:
     1) suporte a "evento.key" (navegadores novos deixaram "keyCode" obsoleto);
     2) preventDefault() nas setas e no espaço, para a página não rolar
        enquanto jogamos.
   ========================================================================= */

// Códigos de teclas - aqui vão todos os que forem necessários
var SETA_ESQUERDA = 37;
var SETA_DIREITA  = 39;
var ESPACO        = 32;

// Tabela usada para traduzir "evento.key" para os mesmos códigos acima
var CODIGOS_DAS_TECLAS = {
   'ArrowLeft' : SETA_ESQUERDA,
   'Left'      : SETA_ESQUERDA,
   'ArrowRight': SETA_DIREITA,
   'Right'     : SETA_DIREITA,
   ' '         : ESPACO,
   'Spacebar'  : ESPACO
};

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

      // Evita que as setas e o espaço rolem a página
      if (tecla == SETA_ESQUERDA || tecla == SETA_DIREITA || tecla == ESPACO)
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
