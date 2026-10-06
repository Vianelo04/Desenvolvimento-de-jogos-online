/* =========================================================================
   efeitos.js - Efeitos visuais passageiros (não participam das colisões)
     Onda          -> anel que se expande no ponto de uma batida;
     TextoFlutuante -> texto que sobe e some ("+50 NÚCLEO", "COLISÃO 1/3").
   Os dois se excluem sozinhos da animação quando terminam.
   ========================================================================= */

function Onda(context, animacao, x, y, cor) {
   this.context  = context;
   this.animacao = animacao;
   this.x = x;
   this.y = y;
   this.cor = cor;
   this.raioFinal = 46;
   this.duracao = 26;
   this.frame = 0;
}
Onda.prototype = {
   atualizar: function() {
      this.frame++;
      if (this.frame >= this.duracao) this.animacao.excluirSprite(this);
   },
   desenhar: function() {
      var ctx = this.context;
      var t = this.frame / this.duracao;     // 0 -> 1

      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - t);
      ctx.strokeStyle = this.cor;
      ctx.lineWidth   = 1 + 3 * (1 - t);
      ctx.shadowColor = this.cor;
      ctx.shadowBlur  = 12;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 6 + (this.raioFinal - 6) * t, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.restore();
   }
}

function TextoFlutuante(context, animacao, x, y, texto, cor) {
   this.context  = context;
   this.animacao = animacao;
   // Mantém o texto dentro da tela
   this.x = Math.max(70, Math.min(context.canvas.width - 70, x));
   this.y = y;
   this.texto = texto;
   this.cor = cor;
   this.duracao = 55;
   this.frame = 0;
}
TextoFlutuante.prototype = {
   atualizar: function() {
      this.y -= 0.7;
      this.frame++;
      if (this.frame >= this.duracao) this.animacao.excluirSprite(this);
   },
   desenhar: function() {
      var ctx = this.context;
      ctx.save();
      ctx.globalAlpha  = Math.max(0, 1 - this.frame / this.duracao);
      ctx.font         = 'bold 14px "Trebuchet MS", Verdana, sans-serif';
      ctx.textAlign    = 'center';
      ctx.lineWidth    = 3;
      ctx.strokeStyle  = 'rgba(5, 7, 15, 0.85)';
      ctx.strokeText(this.texto, this.x, this.y);
      ctx.fillStyle    = this.cor;
      ctx.fillText(this.texto, this.x, this.y);
      ctx.restore();
   }
}
