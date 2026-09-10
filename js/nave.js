/* =========================================================================
   nave.js - A nave Aurora-7 (versão personalizada do "heroi.js")
   Mantém exatamente a mesma lógica do exercício da aula:
     - seta esquerda  -> anda para a esquerda e vira para a esquerda
     - seta direita   -> anda para a direita  e vira para a direita
     - atirar()       -> cria um disparo que sai no sentido da direção atual
   O que mudou: o retângulo virou uma nave (imagem SVG, com desenho vetorial
   de reserva), ganhou propulsor animado, tamanho e velocidade próprios.
   ========================================================================= */

// Códigos únicos para as direções
var DIRECAO_ESQUERDA = 1;
var DIRECAO_DIREITA  = 2;

function Nave(context, teclado, animacao) {
   this.context  = context;
   this.teclado  = teclado;
   this.animacao = animacao;
   this.x = 0;
   this.y = 0;
   this.direcao = DIRECAO_DIREITA;

   // Personalização: tamanho e velocidade da nave
   this.largura    = 64;
   this.altura     = 40;
   this.velocidade = 6;

   // Contadores usados apenas para animar a chama e o clarão do disparo
   this.frame       = 0;
   this.acelerando  = false;
   this.clarao      = 0;

   // Imagem da nave. Se por algum motivo ela não carregar, o método
   // desenharVetorial() assume e a aplicação continua funcionando.
   this.imagemPronta = false;
   this.imagem = new Image();
   var nave = this;
   this.imagem.onload  = function() { nave.imagemPronta = true;  };
   this.imagem.onerror = function() { nave.imagemPronta = false; };
   this.imagem.src = 'imagens/nave.svg';
}
Nave.prototype = {
   atualizar: function() {
      this.frame++;
      this.acelerando = false;
      if (this.clarao > 0) this.clarao--;

      if (this.teclado.pressionada(SETA_ESQUERDA) && this.x > 0) {
         this.direcao = DIRECAO_ESQUERDA;
         this.x -= this.velocidade;
         this.acelerando = true;
      }
      else if (this.teclado.pressionada(SETA_DIREITA) &&
               this.x < this.context.canvas.width - this.largura) {
         this.direcao = DIRECAO_DIREITA;
         this.x += this.velocidade;
         this.acelerando = true;
      }
   },
   desenhar: function() {
      var ctx = this.context;
      ctx.save();

      // Levamos a origem para o centro da nave. Assim, quando ela olha para a
      // esquerda, basta espelhar o eixo X que todo o desenho vira junto.
      ctx.translate(this.x + this.largura / 2, this.y + this.altura / 2);
      if (this.direcao == DIRECAO_ESQUERDA)
         ctx.scale(-1, 1);

      this.desenharPropulsor(ctx);

      if (this.imagemPronta)
         ctx.drawImage(this.imagem, -this.largura / 2, -this.altura / 2,
                       this.largura, this.altura);
      else
         this.desenharVetorial(ctx);

      this.desenharClarao(ctx);

      ctx.restore();
      this.desenharSombra(ctx);
   },
   desenharPropulsor: function(ctx) {
      // A chama fica na traseira da nave (lado esquerdo do desenho local)
      var base    = -this.largura / 2 + 7;
      var tamanho = (this.acelerando ? 34 : 18)
                  + Math.sin(this.frame * 0.6) * 5;   // tremulação
      var abertura = this.acelerando ? 9 : 6;

      ctx.save();

      // Chama externa (magenta -> ciano)
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

      // Núcleo branco da chama
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
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#3ee8ff';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(this.largura / 2 - 2, 0, 6 * forca + 2, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
   },
   desenharSombra: function(ctx) {
      // Um halo suave embaixo da nave, só para dar profundidade
      var centroX = this.x + this.largura / 2;
      var centroY = this.y + this.altura + 6;
      var raio    = 46;

      ctx.save();
      var brilho = ctx.createRadialGradient(centroX, centroY, 2,
                                            centroX, centroY, raio);
      brilho.addColorStop(0, 'rgba(62, 232, 255, 0.20)');
      brilho.addColorStop(1, 'rgba(62, 232, 255, 0)');
      ctx.fillStyle = brilho;
      ctx.beginPath();
      ctx.arc(centroX, centroY, raio, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
   },
   desenharVetorial: function(ctx) {
      // Desenho de reserva: a mesma nave, feita com formas do Canvas.
      // (usado apenas se a imagem imagens/nave.svg não estiver disponível)
      var l = this.largura / 2, a = this.altura / 2;

      // Asas
      ctx.fillStyle = '#ff3ea5';
      ctx.beginPath();
      ctx.moveTo(-l + 8, 0); ctx.lineTo(l * 0.1, -2); ctx.lineTo(-l + 22, -a);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-l + 8, 0); ctx.lineTo(l * 0.1, 2); ctx.lineTo(-l + 22, a);
      ctx.closePath(); ctx.fill();

      // Casco
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

      // Cabine
      ctx.fillStyle = '#3ee8ff';
      ctx.beginPath();
      ctx.ellipse(l * 0.1, -2, 9, 5, 0, 0, 2 * Math.PI);
      ctx.fill();
   },
   atirar: function() {
      var tiro = new Tiro(this.context);

      // O disparo nasce na ponta do canhão, no lado para onde a nave olha
      tiro.y = this.y + this.altura / 2;

      // Lendo a direção atual
      if (this.direcao == DIRECAO_ESQUERDA) {
         tiro.x = this.x;
         tiro.velocidadeX = -16;
      }
      else {
         tiro.x = this.x + this.largura;
         tiro.velocidadeX = 16;
      }

      this.clarao = 8;   // acende o canhão por alguns frames
      this.animacao.novoSprite(tiro);
   }
}
