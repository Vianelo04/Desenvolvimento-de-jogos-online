/* =========================================================================
   animacao.js - Motor da animação (loop principal)
   Baseado no arquivo do professor, com dois acréscimos:
     1) um sprite de fundo (o campo de estrelas), desenhado antes dos demais;
     2) remoção automática dos sprites marcados com "remover = true"
        (os tiros que saem da tela), para a lista não crescer para sempre.
   ========================================================================= */

function Animacao(context) {
   this.context = context;
   this.sprites = [];
   this.fundo = null;      // sprite opcional desenhado atrás de tudo
   this.ligado = false;
}
Animacao.prototype = {
   novoSprite: function(sprite) {
      this.sprites.push(sprite);
   },
   definirFundo: function(sprite) {
      this.fundo = sprite;
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

      // A cada ciclo, limpamos a tela ou desenhamos um fundo
      this.limparTela();

      if (this.fundo) {
         this.fundo.atualizar();
         this.fundo.desenhar();
      }

      // Atualizamos o estado dos sprites
      for (var i in this.sprites)
         this.sprites[i].atualizar();

      // Descartamos os sprites que já não são mais necessários
      this.limparSprites();

      // Desenhamos os sprites
      for (var i in this.sprites)
         this.sprites[i].desenhar();

      // Chamamos o próximo ciclo
      var animacao = this;
      requestAnimationFrame(function() {
         animacao.proximoFrame();
      });
   },
   limparSprites: function() {
      // Percorremos de trás para frente para poder remover com segurança
      for (var i = this.sprites.length - 1; i >= 0; i--) {
         if (this.sprites[i].remover)
            this.sprites.splice(i, 1);
      }
   },
   limparTela: function() {
      var ctx = this.context;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
   }
}
