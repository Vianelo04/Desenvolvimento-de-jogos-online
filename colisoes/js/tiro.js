/* =========================================================================
   tiro.js - O laser da nave (o mesmo da Aurora-7, agora na vertical)

   REQUISITO 2 (também): quando o laser toca a Sentinela ou uma das bolas,
   ele DESAPARECE - é excluído da animação e do colisor.
   ========================================================================= */

function Tiro(context, animacao, colisor) {
   this.context  = context;
   this.animacao = animacao;
   this.colisor  = colisor;
   this.x = 0;
   this.y = 0;
   this.velocidadeX = 0;
   this.velocidadeY = 0;

   // Atributos de desenho
   this.cor         = '#3ee8ff';   // ciano neon
   this.comprimento = 12;          // "raio" vertical do laser
   this.espessura   = 3;           // "raio" horizontal do laser
}
Tiro.prototype = {
   atualizar: function() {
      this.x += this.velocidadeX;
      this.y += this.velocidadeY;

      // Saiu da tela? Então pode ser descartado
      var altura = this.context.canvas.height;
      if (this.y < -40 || this.y > altura + 40)
         this.sumir();
   },
   desenhar: function() {
      var ctx = this.context;
      ctx.save();

      // Rastro: um degradê que se apaga atrás do laser
      var sentido = (this.velocidadeY < 0) ? 1 : -1;   // lado oposto ao movimento
      var fimDoRastro = this.y + sentido * 40;
      var rastro = ctx.createLinearGradient(this.x, this.y, this.x, fimDoRastro);
      rastro.addColorStop(0, 'rgba(62, 232, 255, 0.55)');
      rastro.addColorStop(1, 'rgba(62, 232, 255, 0)');
      ctx.fillStyle = rastro;
      ctx.fillRect(this.x - this.espessura / 2, Math.min(this.y, fimDoRastro),
                   this.espessura, 40);

      // Corpo do laser, com brilho ao redor
      ctx.shadowColor = this.cor;
      ctx.shadowBlur  = 14;
      ctx.fillStyle   = this.cor;
      ctx.beginPath();
      ctx.ellipse(this.x, this.y, this.espessura, this.comprimento,
                  0, 0, 2 * Math.PI);
      ctx.fill();

      // Núcleo branco
      ctx.shadowBlur = 0;
      ctx.fillStyle  = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(this.x, this.y, this.espessura * 0.4, this.comprimento * 0.5,
                  0, 0, 2 * Math.PI);
      ctx.fill();

      ctx.restore();
   },
   sumir: function() {
      this.animacao.excluirSprite(this);
      this.colisor.excluirSprite(this);
   },

   // Interface de colisão
   retangulosColisao: function() {
      return [
         {
            x: this.x - this.espessura,
            y: this.y - this.comprimento,
            largura: this.espessura * 2,
            altura:  this.comprimento * 2,
            nome: 'laser'
         }
      ];
   },
   colidiuCom: function(outro) {
      // O laser some ao acertar a Sentinela ou ao ser absorvido por uma bola.
      // (Ele nasce encostado na nave e atravessa os cristais: nesses casos
      // não acontece nada.)
      if (outro instanceof Sentinela || outro instanceof Bola)
         this.sumir();
   }
}
