/* =========================================================================
   estrelas.js - Cenário (reaproveitado da Aurora-7)
   Agora as estrelas "caem" de cima para baixo, dando a impressão de que a
   nave avança em direção à Sentinela, no alto da tela.
   É um sprite como qualquer outro (tem atualizar() e desenhar()), mas a
   Animacao o desenha antes de todos os outros, como plano de fundo.
   ========================================================================= */

function CampoDeEstrelas(context, quantidade) {
   this.context = context;
   this.estrelas = [];

   var largura = context.canvas.width;
   var altura  = context.canvas.height;

   for (var i = 0; i < quantidade; i++) {
      this.estrelas.push({
         x: Math.random() * largura,
         y: Math.random() * altura,
         raio: Math.random() * 1.6 + 0.4,
         // Estrelas maiores parecem mais próximas, então andam mais rápido
         velocidade: Math.random() * 0.9 + 0.3
      });
   }
}
CampoDeEstrelas.prototype = {
   atualizar: function() {
      var largura = this.context.canvas.width;
      var altura  = this.context.canvas.height;

      for (var i = 0; i < this.estrelas.length; i++) {
         var estrela = this.estrelas[i];
         estrela.y += estrela.velocidade;
         if (estrela.y > altura) {                   // voltou lá para cima
            estrela.y = 0;
            estrela.x = Math.random() * largura;
         }
      }
   },
   desenhar: function() {
      var ctx     = this.context;
      var largura = ctx.canvas.width;
      var altura  = ctx.canvas.height;

      ctx.save();

      // Céu profundo
      var ceu = ctx.createLinearGradient(0, 0, 0, altura);
      ceu.addColorStop(0,   '#050a1f');
      ceu.addColorStop(0.6, '#0b1636');
      ceu.addColorStop(1,   '#131a45');
      ctx.fillStyle = ceu;
      ctx.fillRect(0, 0, largura, altura);

      // Nebulosa ao fundo
      var nebulosa = ctx.createRadialGradient(largura * 0.78, altura * 0.42, 10,
                                              largura * 0.78, altura * 0.42, 280);
      nebulosa.addColorStop(0, 'rgba(255, 62, 165, 0.16)');
      nebulosa.addColorStop(1, 'rgba(255, 62, 165, 0)');
      ctx.fillStyle = nebulosa;
      ctx.fillRect(0, 0, largura, altura);

      // Estrelas
      ctx.fillStyle = '#ffffff';
      for (var i = 0; i < this.estrelas.length; i++) {
         var estrela = this.estrelas[i];
         ctx.globalAlpha = 0.35 + estrela.raio / 2.6;
         ctx.beginPath();
         ctx.arc(estrela.x, estrela.y, estrela.raio, 0, 2 * Math.PI);
         ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Planeta no canto inferior esquerdo
      var planeta = ctx.createRadialGradient(90, altura + 40, 20,
                                             130, altura + 60, 190);
      planeta.addColorStop(0,   '#2f7bd6');
      planeta.addColorStop(0.7, '#123a70');
      planeta.addColorStop(1,   '#0a1330');
      ctx.fillStyle = planeta;
      ctx.beginPath();
      ctx.arc(130, altura + 60, 150, 0, 2 * Math.PI);
      ctx.fill();

      ctx.restore();
   }
}
