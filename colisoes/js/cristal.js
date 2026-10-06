/* =========================================================================
   cristal.js - Cristal de energia

   REQUISITO 2: colisão entre dois objetos em que, ao se tocarem, um deles
   DESAPARECE da tela. Quando a nave toca o cristal, ele é excluído da
   animação (não é mais desenhado) e do colisor (não colide mais) e avisa o
   jogo (aoSerColetado), que soma os pontos e cria outro cristal.
   ========================================================================= */

var DURACAO_DO_SURGIMENTO = 30;   // quadros que o cristal leva para aparecer

function Cristal(context, animacao, colisor) {
   this.context  = context;
   this.animacao = animacao;
   this.colisor  = colisor;
   this.x = 0;     // centro do cristal
   this.y = 0;
   this.frame = Math.floor(Math.random() * 100);

   // Enquanto está surgindo, o cristal ainda não pode ser coletado
   this.nascendo = DURACAO_DO_SURGIMENTO;

   // Função avisada quando a nave coleta o cristal
   this.aoSerColetado = null;
}
Cristal.prototype = {
   atualizar: function() {
      this.frame++;
      if (this.nascendo > 0) this.nascendo--;
   },
   desenhar: function() {
      var ctx = this.context;
      var surgimento = 1 - this.nascendo / DURACAO_DO_SURGIMENTO;   // 0 -> 1

      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.globalAlpha = surgimento;

      // Halo
      var halo = ctx.createRadialGradient(0, 0, 2, 0, 0, 26);
      halo.addColorStop(0, 'rgba(255, 210, 62, 0.35)');
      halo.addColorStop(1, 'rgba(255, 210, 62, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, 2 * Math.PI);
      ctx.fill();

      // O cristal "gira": achatamos o desenho na horizontal
      var giro    = 0.3 + 0.7 * Math.abs(Math.cos(this.frame * 0.05));
      var tamanho = Math.max(surgimento, 0.05);     // cresce enquanto surge
      ctx.scale(giro * tamanho, tamanho);

      var pedra = ctx.createLinearGradient(-10, -15, 10, 15);
      pedra.addColorStop(0,   '#fff6c2');
      pedra.addColorStop(0.5, '#ffd23e');
      pedra.addColorStop(1,   '#c98a00');
      ctx.fillStyle   = pedra;
      ctx.shadowColor = '#ffd23e';
      ctx.shadowBlur  = 16;
      ctx.beginPath();
      ctx.moveTo(0, -15);
      ctx.lineTo(10, -3);
      ctx.lineTo(0, 15);
      ctx.lineTo(-10, -3);
      ctx.closePath();
      ctx.fill();

      // Lapidação
      ctx.shadowBlur  = 0;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth   = 1;
      ctx.beginPath();
      ctx.moveTo(-10, -3);
      ctx.lineTo(10, -3);
      ctx.moveTo(0, -15);
      ctx.lineTo(0, 15);
      ctx.stroke();

      ctx.restore();
   },
   sumir: function() {
      this.animacao.excluirSprite(this);
      this.colisor.excluirSprite(this);
   },

   // Interface de colisão
   retangulosColisao: function() {
      // Enquanto surge, o cristal ainda não tem retângulo (não colide)
      if (this.nascendo > 0) return [];

      return [
         { x: this.x - 10, y: this.y - 15, largura: 20, altura: 30, nome: 'cristal' }
      ];
   },
   colidiuCom: function(outro) {
      // A nave tocou o cristal: ele desaparece da tela
      if (outro instanceof Nave) {
         this.sumir();
         if (this.aoSerColetado) this.aoSerColetado(this);
      }
   }
}
