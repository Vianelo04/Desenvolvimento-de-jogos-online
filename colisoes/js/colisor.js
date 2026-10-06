/* =========================================================================
   colisor.js - Detecção de colisões (baseado no colisor.js do professor)

   Cada sprite que participa das colisões precisa ter dois métodos:
     retangulosColisao()  -> devolve a lista de retângulos do sprite;
     colidiuCom(...)      -> é chamado quando ele bate em outro sprite.

   O que mudou em relação ao arquivo original:
     1) QUAL RETÂNGULO FOI ATINGIDO: quando dois retângulos se cruzam, o
        Colisor diz a cada sprite qual retângulo DELE e qual retângulo do
        OUTRO participaram da colisão:
           sprite.colidiuCom(outroSprite, meuRetangulo, retanguloDoOutro)
        Cada retângulo pode ter um "nome". Assim um sprite com vários
        retângulos (a Sentinela) sabe exatamente que parte foi atingida.
     2) excluirSprite(): tira um sprite dos testes (o cristal coletado, o
        laser que acertou o alvo...). Como na Animacao, a exclusão só é
        feita no fim do processamento, para não atrapalhar os laços.
     3) Cada PAR de sprites é testado uma única vez por quadro (i < j).
        Isso substitui o controle "jaTestados" com strings do original,
        com o mesmo resultado e menos trabalho.
     4) desenharRetangulos(): desenha o contorno de todos os retângulos de
        colisão (tecla C), para enxergarmos o que o Colisor "vê".
   ========================================================================= */

function Colisor() {
   this.sprites = [];
   this.spritesExcluir = [];
   this.aoColidir = null;   // tratador geral (opcional), como no original
}
Colisor.prototype = {
   novoSprite: function(sprite) {
      this.sprites.push(sprite);
   },
   excluirSprite: function(sprite) {
      if (this.spritesExcluir.indexOf(sprite) < 0)
         this.spritesExcluir.push(sprite);
   },
   processar: function() {
      // Testamos cada par uma única vez: (0,1), (0,2), (1,2), ...
      for (var i = 0; i < this.sprites.length; i++) {
         for (var j = i + 1; j < this.sprites.length; j++) {
            this.testarColisao(this.sprites[i], this.sprites[j]);
         }
      }

      this.processarExclusoes();
   },
   testarColisao: function(sprite1, sprite2) {
      // Quem já pediu para sair neste quadro (ex.: o laser que acabou de
      // acertar alguma coisa) não colide com mais ninguém
      if (this.vaiSair(sprite1) || this.vaiSair(sprite2)) return;

      // Obter os retângulos de colisão de cada sprite
      var rets1 = sprite1.retangulosColisao();
      var rets2 = sprite2.retangulosColisao();

      // Testar as colisões entre eles
      for (var i = 0; i < rets1.length; i++) {
         for (var j = 0; j < rets2.length; j++) {
            if (this.retangulosColidem(rets1[i], rets2[j])) {
               // Eles colidem! Avisamos os dois, dizendo QUAL retângulo de
               // cada um foi atingido
               sprite1.colidiuCom(sprite2, rets1[i], rets2[j]);
               sprite2.colidiuCom(sprite1, rets2[j], rets1[i]);

               // Tratador geral
               if (this.aoColidir)
                  this.aoColidir(sprite1, sprite2, rets1[i], rets2[j]);

               // Não precisa terminar de ver todos os retângulos
               return;
            }
         }
      }
   },
   retangulosColidem: function(ret1, ret2) {
      // Fórmula de interseção de retângulos
      return (ret1.x + ret1.largura) > ret2.x &&
             ret1.x < (ret2.x + ret2.largura) &&
             (ret1.y + ret1.altura) > ret2.y &&
             ret1.y < (ret2.y + ret2.altura);
   },
   vaiSair: function(sprite) {
      return this.spritesExcluir.indexOf(sprite) >= 0;
   },
   processarExclusoes: function() {
      var novaLista = [];
      for (var i = 0; i < this.sprites.length; i++) {
         if (! this.vaiSair(this.sprites[i]))
            novaLista.push(this.sprites[i]);
      }
      this.sprites = novaLista;
      this.spritesExcluir = [];
   },
   desenharRetangulos: function(ctx) {
      ctx.save();
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 3]);
      ctx.strokeStyle = 'rgba(157, 255, 107, 0.8)';
      ctx.fillStyle   = 'rgba(157, 255, 107, 0.95)';
      ctx.font = 'bold 8px Verdana, sans-serif';
      ctx.textBaseline = 'top';

      for (var i = 0; i < this.sprites.length; i++) {
         var rets = this.sprites[i].retangulosColisao();

         for (var j = 0; j < rets.length; j++) {
            var r = rets[j];
            ctx.strokeRect(r.x + 0.5, r.y + 0.5, r.largura, r.altura);

            // Retângulos com rótulo (as partes da Sentinela) ganham o nome
            // escrito dentro deles - ou logo abaixo, se não couber
            if (r.rotulo) {
               var larguraTexto = ctx.measureText(r.rotulo).width;
               if (larguraTexto + 6 <= r.largura)
                  ctx.fillText(r.rotulo, r.x + 3, r.y + 3);
               else
                  ctx.fillText(r.rotulo, r.x + (r.largura - larguraTexto) / 2,
                               r.y + r.altura + 3);
            }
         }
      }

      ctx.restore();
   }
}
