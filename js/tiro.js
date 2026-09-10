/* =========================================================================
   tiro.js - O disparo da nave (versão personalizada do "bola.js")
   Em vez de uma bolinha preta de raio 10, temos um raio laser alongado,
   com brilho (glow) e rastro, na cor ciano.
   ========================================================================= */

function Tiro(context) {
   this.context = context;
   this.x = 0;
   this.y = 0;
   this.velocidadeX = 0;
   this.velocidadeY = 0;

   // Atributos de desenho padrão (personalizados!)
   this.cor        = '#3ee8ff';   // ciano neon
   this.comprimento = 14;         // "raio" horizontal do laser
   this.espessura   = 3;          // "raio" vertical do laser

   // Quando vira true, a Animacao descarta este sprite
   this.remover = false;
}
Tiro.prototype = {
   atualizar: function() {
      this.x += this.velocidadeX;
      this.y += this.velocidadeY;

      // Saiu da tela? Então pode ser descartado
      var largura = this.context.canvas.width;
      if (this.x < -50 || this.x > largura + 50)
         this.remover = true;
   },
   desenhar: function() {
      var ctx = this.context;

      // Guardar configurações atuais do contexto
      ctx.save();

      // Rastro: um degradê que se apaga atrás do laser
      var sentido  = (this.velocidadeX < 0) ? 1 : -1;   // lado oposto ao movimento
      var fimDoRastro = this.x + sentido * 42;
      var rastro = ctx.createLinearGradient(this.x, this.y, fimDoRastro, this.y);
      rastro.addColorStop(0, 'rgba(62, 232, 255, 0.55)');
      rastro.addColorStop(1, 'rgba(62, 232, 255, 0)');
      ctx.fillStyle = rastro;
      ctx.fillRect(Math.min(this.x, fimDoRastro), this.y - this.espessura / 2,
                   42, this.espessura);

      // Corpo do laser, com brilho ao redor
      ctx.shadowColor = this.cor;
      ctx.shadowBlur  = 14;
      ctx.fillStyle   = this.cor;
      ctx.beginPath();
      ctx.ellipse(this.x, this.y, this.comprimento, this.espessura,
                  0, 0, 2 * Math.PI);
      ctx.fill();

      // Núcleo branco, para dar a impressão de energia concentrada
      ctx.shadowBlur = 0;
      ctx.fillStyle  = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(this.x, this.y, this.comprimento * 0.5, this.espessura * 0.4,
                  0, 0, 2 * Math.PI);
      ctx.fill();

      // Voltar às configurações anteriores
      ctx.restore();
   }
}
