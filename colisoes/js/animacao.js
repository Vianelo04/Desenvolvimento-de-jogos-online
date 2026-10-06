/* =========================================================================
   animacao.js - Motor da animação (loop principal)
   Baseado no animacao.js do professor. Acréscimos para esta atividade:
     1) processamentos: objetos executados a cada quadro, logo depois de
        atualizar os sprites. É aqui que entra o Colisor;
     2) excluirSprite(): tira um sprite da animação com segurança. A
        exclusão só acontece depois que os laços do quadro terminam;
     3) um sprite de fundo (as estrelas), desenhado antes de todos, e um
        painel desenhado por cima de tudo (placar, retângulos de colisão e
        as telas de início e de Game Over).
   ========================================================================= */

function Animacao(context) {
   this.context = context;
   this.sprites = [];
   this.processamentos = [];
   this.spritesExcluir = [];
   this.fundo  = null;     // desenhado atrás de tudo
   this.painel = null;     // desenhado na frente de tudo
   this.ligado = false;
}
Animacao.prototype = {
   novoSprite: function(sprite) {
      this.sprites.push(sprite);
   },
   excluirSprite: function(sprite) {
      this.spritesExcluir.push(sprite);
   },
   novoProcessamento: function(processamento) {
      this.processamentos.push(processamento);
   },
   definirFundo: function(sprite) {
      this.fundo = sprite;
   },
   definirPainel: function(sprite) {
      this.painel = sprite;
   },
   ligar: function() {
      this.ligado = true;
      this.proximoFrame();
   },
   desligar: function() {
      this.ligado = false;
   },
   proximoFrame: function() {
      // Posso continuar?
      if ( ! this.ligado ) return;

      // 1) Atualizamos o estado do fundo, dos sprites e do painel
      if (this.fundo) this.fundo.atualizar();

      for (var i = 0; i < this.sprites.length; i++)
         this.sprites[i].atualizar();

      if (this.painel) this.painel.atualizar();

      // 2) Processamentos (o Colisor testa e trata as colisões aqui)
      for (var i = 0; i < this.processamentos.length; i++)
         this.processamentos[i].processar();

      // 3) Retiramos os sprites que pediram para sair
      this.processarExclusoes();

      // 4) Desenhamos o quadro
      this.desenhar();

      // Chamamos o próximo ciclo. Se o jogo acabou durante este quadro
      // (Game Over), a animação já foi desligada e o loop para aqui.
      if (this.ligado) {
         var animacao = this;
         requestAnimationFrame(function() {
            animacao.proximoFrame();
         });
      }
   },
   desenhar: function() {
      this.limparTela();

      if (this.fundo) this.fundo.desenhar();

      for (var i = 0; i < this.sprites.length; i++)
         this.sprites[i].desenhar();

      if (this.painel) this.painel.desenhar();
   },
   processarExclusoes: function() {
      // Montamos uma nova lista só com quem continua no jogo
      var novaLista = [];
      for (var i = 0; i < this.sprites.length; i++) {
         if (this.spritesExcluir.indexOf(this.sprites[i]) < 0)
            novaLista.push(this.sprites[i]);
      }
      this.sprites = novaLista;
      this.spritesExcluir = [];
   },
   limparTela: function() {
      var ctx = this.context;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
   }
}
