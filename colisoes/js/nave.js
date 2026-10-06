/* =========================================================================
   nave.js - A nave Aurora-7 (a mesma da atividade anterior)
   Novidades nesta atividade:
     - a nave fica "em pé" (apontando para cima) e anda nas 4 direções;
     - o laser sai para cima, em direção à Sentinela;
     - ela também é um sprite de colisão, com DOIS retângulos (cabine e
       asas). As bolas quicam nela e os cristais somem quando ela os toca.
   ========================================================================= */

function Nave(context, teclado, animacao, colisor) {
   this.context  = context;
   this.teclado  = teclado;
   this.animacao = animacao;
   this.colisor  = colisor;
   this.x = 0;
   this.y = 0;

   // Tamanho na tela (em pé) e velocidade
   this.largura    = 40;
   this.altura     = 64;
   this.velocidade = 5;
   this.limiteSuperior = 0;   // a nave não sobe além desta linha

   // Contadores usados para animar a chama, o clarão do disparo e o escudo
   this.frame      = 0;
   this.acelerando = false;
   this.clarao     = 0;
   this.escudo     = 0;

   // Imagem da nave. Se ela não carregar, desenharVetorial() assume.
   this.imagemPronta = false;
   this.imagem = new Image();
   var nave = this;
   this.imagem.onload  = function() { nave.imagemPronta = true;  };
   this.imagem.onerror = function() { nave.imagemPronta = false; };
   this.imagem.src = 'imagens/nave.svg';
}
Nave.prototype = {
   atualizar: function() {
      var largura = this.context.canvas.width;
      var altura  = this.context.canvas.height;

      this.frame++;
      this.acelerando = false;
      if (this.clarao > 0) this.clarao--;
      if (this.escudo > 0) this.escudo--;

      if (this.teclado.pressionada(SETA_ESQUERDA))
         this.x -= this.velocidade;
      else if (this.teclado.pressionada(SETA_DIREITA))
         this.x += this.velocidade;

      if (this.teclado.pressionada(SETA_ACIMA)) {
         this.y -= this.velocidade;
         this.acelerando = true;
      }
      else if (this.teclado.pressionada(SETA_ABAIXO))
         this.y += this.velocidade;

      // Mantém a nave dentro da sua área
      this.x = Math.max(0, Math.min(largura - this.largura, this.x));
      this.y = Math.max(this.limiteSuperior, Math.min(altura - this.altura, this.y));
   },
   desenhar: function() {
      var ctx = this.context;
      ctx.save();

      // Origem no centro da nave
      ctx.translate(this.x + this.largura / 2, this.y + this.altura / 2);
      this.desenharEscudo(ctx);

      // O desenho original aponta para a direita: giramos 90° para cima
      ctx.rotate(-Math.PI / 2);

      this.desenharPropulsor(ctx);

      if (this.imagemPronta)
         ctx.drawImage(this.imagem, -this.altura / 2, -this.largura / 2,
                       this.altura, this.largura);
      else
         this.desenharVetorial(ctx);

      this.desenharClarao(ctx);
      ctx.restore();
   },
   desenharEscudo: function(ctx) {
      // Anel de energia que acende quando uma bola bate na nave
      if (this.escudo <= 0) return;
      var forca = this.escudo / 12;
      ctx.save();
      ctx.strokeStyle = 'rgba(62, 232, 255, ' + (0.85 * forca) + ')';
      ctx.fillStyle   = 'rgba(62, 232, 255, ' + (0.10 * forca) + ')';
      ctx.lineWidth   = 2;
      ctx.shadowColor = '#3ee8ff';
      ctx.shadowBlur  = 14;
      ctx.beginPath();
      ctx.arc(0, 0, 40, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
   },
   desenharPropulsor: function(ctx) {
      // A chama fica na traseira da nave (lado esquerdo do desenho local,
      // que depois de girado fica embaixo)
      var base     = -this.altura / 2 + 7;
      var tamanho  = (this.acelerando ? 34 : 18) + Math.sin(this.frame * 0.6) * 5;
      var abertura = this.acelerando ? 9 : 6;

      ctx.save();

      var fogo = ctx.createLinearGradient(base, 0, base - tamanho, 0);
      fogo.addColorStop(0,    'rgba(62, 232, 255, 0.9)');
      fogo.addColorStop(0.55, 'rgba(120, 120, 255, 0.55)');
      fogo.addColorStop(1,    'rgba(255, 62, 165, 0)');
      ctx.fillStyle   = fogo;
      ctx.shadowColor = '#3ee8ff';
      ctx.shadowBlur  = 16;
      ctx.beginPath();
      ctx.moveTo(base, -abertura);
      ctx.lineTo(base - tamanho, 0);
      ctx.lineTo(base, abertura);
      ctx.closePath();
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.fillStyle  = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.moveTo(base, -abertura / 2.4);
      ctx.lineTo(base - tamanho * 0.45, 0);
      ctx.lineTo(base, abertura / 2.4);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
   },
   desenharClarao: function(ctx) {
      // Pequeno brilho no canhão logo depois de atirar
      if (this.clarao <= 0) return;
      var forca = this.clarao / 8;
      ctx.save();
      ctx.globalAlpha = forca;
      ctx.fillStyle   = '#ffffff';
      ctx.shadowColor = '#3ee8ff';
      ctx.shadowBlur  = 18;
      ctx.beginPath();
      ctx.arc(this.altura / 2 - 2, 0, 6 * forca + 2, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
   },
   desenharVetorial: function(ctx) {
      // Desenho de reserva (se imagens/nave.svg não estiver disponível)
      var l = this.altura / 2, a = this.largura / 2;

      ctx.fillStyle = '#ff3ea5';
      ctx.beginPath();
      ctx.moveTo(-l + 8, 0); ctx.lineTo(l * 0.1, -2); ctx.lineTo(-l + 22, -a);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-l + 8, 0); ctx.lineTo(l * 0.1, 2); ctx.lineTo(-l + 22, a);
      ctx.closePath(); ctx.fill();

      var casco = ctx.createLinearGradient(0, -a, 0, a);
      casco.addColorStop(0,    '#f2f7ff');
      casco.addColorStop(0.45, '#b9cbe6');
      casco.addColorStop(1,    '#4a6a94');
      ctx.fillStyle = casco;
      ctx.beginPath();
      ctx.moveTo(-l + 4, -8);
      ctx.lineTo(l * 0.2, -10);
      ctx.quadraticCurveTo(l, -4, l, 0);
      ctx.quadraticCurveTo(l, 4, l * 0.2, 10);
      ctx.lineTo(-l + 4, 8);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#3ee8ff';
      ctx.beginPath();
      ctx.ellipse(l * 0.1, -2, 9, 5, 0, 0, 2 * Math.PI);
      ctx.fill();
   },
   atirar: function() {
      var tiro = new Tiro(this.context, this.animacao, this.colisor);

      // O laser nasce na ponta do canhão e sobe
      tiro.x = this.x + this.largura / 2;
      tiro.y = this.y - 6;
      tiro.velocidadeY = -12;

      this.clarao = 8;
      this.animacao.novoSprite(tiro);
      this.colisor.novoSprite(tiro);
   },

   // Interface de colisão: a nave tem DOIS retângulos
   retangulosColisao: function() {
      return [
         { x: this.x + 12, y: this.y + 2,  largura: 16, altura: 30, nome: 'cabine' },
         { x: this.x + 3,  y: this.y + 32, largura: 34, altura: 28, nome: 'asas' }
      ];
   },
   colidiuCom: function(outro) {
      // Quando uma bola bate na nave, o escudo acende
      if (outro instanceof Bola) this.escudo = 12;
   }
}
