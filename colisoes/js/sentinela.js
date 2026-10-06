/* =========================================================================
   sentinela.js - A Sentinela X-9, a estação inimiga no alto da tela

   REQUISITO 1: um Sprite com MAIS DE UM retângulo de colisão, e uma forma
   de identificar QUAL retângulo foi atingido.

   Cada parte da Sentinela é um retângulo com um nome:
       asaEsquerda | nucleo | asaDireita | canhao
   O Colisor entrega para colidiuCom() o retângulo que foi atingido
   ("meuRetangulo"). Pelo nome dele encontramos a parte, que pisca, conta
   o acerto e avisa o jogo (aoSerAtingida) para somar os pontos e mostrar
   o nome no placar.
   ========================================================================= */

var DURACAO_DO_PISCAR = 14;   // quadros que a parte atingida fica acesa

function Sentinela(context) {
   this.context = context;
   this.x = 0;
   this.y = 0;
   this.largura = 210;
   this.altura  = 78;
   this.velocidadeX = 2;
   this.frame = 0;

   // Função avisada quando um laser acerta uma das partes
   this.aoSerAtingida = null;

   // As partes: cada uma vira UM retângulo de colisão. As posições são
   // relativas ao canto superior esquerdo (x, y) da Sentinela.
   this.partes = [
      { nome: 'asaEsquerda', rotulo: 'ASA ESQUERDA', pontos: 10,
        x: 0,   y: 16, largura: 70, altura: 30 },
      { nome: 'nucleo',      rotulo: 'NÚCLEO',       pontos: 50,
        x: 70,  y: 0,  largura: 70, altura: 54 },
      { nome: 'asaDireita',  rotulo: 'ASA DIREITA',  pontos: 10,
        x: 140, y: 16, largura: 70, altura: 30 },
      { nome: 'canhao',      rotulo: 'CANHÃO',       pontos: 25,
        x: 91,  y: 54, largura: 28, altura: 24 }
   ];

   for (var i = 0; i < this.partes.length; i++) {
      this.partes[i].atingida = 0;   // contagem regressiva do piscar
      this.partes[i].acertos  = 0;   // quantas vezes esta parte foi atingida
   }
}
Sentinela.prototype = {
   atualizar: function() {
      var limite = this.context.canvas.width - this.largura - 12;

      // Patrulha de um lado para o outro
      if (this.x < 12)     this.velocidadeX = Math.abs(this.velocidadeX);
      if (this.x > limite) this.velocidadeX = -Math.abs(this.velocidadeX);
      this.x += this.velocidadeX;

      this.frame++;
      for (var i = 0; i < this.partes.length; i++) {
         if (this.partes[i].atingida > 0) this.partes[i].atingida--;
      }
   },
   desenhar: function() {
      var ctx = this.context;
      ctx.save();
      ctx.translate(this.x, this.y);

      this.desenharAsa(ctx, this.buscarParte('asaEsquerda'), -1);
      this.desenharAsa(ctx, this.buscarParte('asaDireita'),   1);
      this.desenharCanhao(ctx, this.buscarParte('canhao'));
      this.desenharNucleo(ctx, this.buscarParte('nucleo'));

      // O retângulo atingido pisca
      for (var i = 0; i < this.partes.length; i++) {
         var p = this.partes[i];
         if (p.atingida <= 0) continue;

         var forca = p.atingida / DURACAO_DO_PISCAR;
         ctx.fillStyle   = 'rgba(255, 255, 255, ' + (0.55 * forca) + ')';
         ctx.strokeStyle = 'rgba(255, 210, 62, ' + forca + ')';
         ctx.lineWidth   = 2;
         ctx.fillRect(p.x, p.y, p.largura, p.altura);
         ctx.strokeRect(p.x, p.y, p.largura, p.altura);
      }

      ctx.restore();
   },
   desenharAsa: function(ctx, p, lado) {
      // lado: -1 = asa esquerda, 1 = asa direita
      var interno = (lado < 0) ? p.x + p.largura : p.x;
      var externo = (lado < 0) ? p.x : p.x + p.largura;
      var quina   = externo - lado * 10;

      var painel = ctx.createLinearGradient(0, p.y, 0, p.y + p.altura);
      painel.addColorStop(0, '#34406a');
      painel.addColorStop(1, '#151b33');
      ctx.fillStyle   = painel;
      ctx.strokeStyle = '#5a6fae';
      ctx.lineWidth   = 1.5;
      ctx.beginPath();
      ctx.moveTo(interno, p.y + 2);
      ctx.lineTo(quina,   p.y);
      ctx.lineTo(externo, p.y + p.altura / 2);
      ctx.lineTo(quina,   p.y + p.altura);
      ctx.lineTo(interno, p.y + p.altura - 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Placas de energia
      ctx.strokeStyle = 'rgba(255, 62, 165, 0.55)';
      ctx.lineWidth   = 2;
      for (var k = 1; k <= 4; k++) {
         var linhaX = interno - lado * k * 12;
         ctx.beginPath();
         ctx.moveTo(linhaX, p.y + 6);
         ctx.lineTo(linhaX, p.y + p.altura - 6);
         ctx.stroke();
      }

      // Luz de sinalização na ponta da asa
      var piscando = (Math.floor(this.frame / 20) % 2 == 0);
      ctx.fillStyle = piscando ? '#ff3e5e' : '#5a1020';
      ctx.beginPath();
      ctx.arc(externo - lado * 6, p.y + p.altura / 2, 2.5, 0, 2 * Math.PI);
      ctx.fill();
   },
   desenharNucleo: function(ctx, p) {
      var casco = ctx.createLinearGradient(0, p.y, 0, p.y + p.altura);
      casco.addColorStop(0, '#4a5b92');
      casco.addColorStop(1, '#1b2240');
      ctx.fillStyle   = casco;
      ctx.strokeStyle = '#7d92d6';
      ctx.lineWidth   = 1.5;
      ctx.beginPath();
      ctx.moveTo(p.x + 8,             p.y);
      ctx.lineTo(p.x + p.largura - 8, p.y);
      ctx.lineTo(p.x + p.largura,     p.y + 14);
      ctx.lineTo(p.x + p.largura,     p.y + p.altura - 10);
      ctx.lineTo(p.x + p.largura - 14, p.y + p.altura);
      ctx.lineTo(p.x + 14,            p.y + p.altura);
      ctx.lineTo(p.x,                 p.y + p.altura - 10);
      ctx.lineTo(p.x,                 p.y + 14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // O "olho" do núcleo, pulsando
      var cx = p.x + p.largura / 2;
      var cy = p.y + 26;
      var pulso = 0.5 + Math.sin(this.frame * 0.1) * 0.5;

      ctx.fillStyle = '#0d1226';
      ctx.beginPath();
      ctx.arc(cx, cy, 17, 0, 2 * Math.PI);
      ctx.fill();

      var olho = ctx.createRadialGradient(cx - 3, cy - 3, 1, cx, cy, 14);
      olho.addColorStop(0,   '#fff4d6');
      olho.addColorStop(0.4, '#ff9a3e');
      olho.addColorStop(1,   '#ff3e5e');
      ctx.shadowColor = '#ff3e5e';
      ctx.shadowBlur  = 10 + pulso * 14;
      ctx.fillStyle   = olho;
      ctx.beginPath();
      ctx.arc(cx, cy, 12 + pulso * 2, 0, 2 * Math.PI);
      ctx.fill();
      ctx.shadowBlur = 0;
   },
   desenharCanhao: function(ctx, p) {
      var cx = p.x + p.largura / 2;

      // Suporte
      ctx.fillStyle = '#2a3457';
      ctx.beginPath();
      ctx.moveTo(p.x,                 p.y);
      ctx.lineTo(p.x + p.largura,     p.y);
      ctx.lineTo(p.x + p.largura - 5, p.y + 10);
      ctx.lineTo(p.x + 5,             p.y + 10);
      ctx.closePath();
      ctx.fill();

      // Cano
      ctx.fillStyle = '#8fa3d9';
      ctx.fillRect(cx - 5, p.y + 8, 10, p.altura - 8);

      // Boca do canhão
      ctx.fillStyle   = '#ff3e5e';
      ctx.shadowColor = '#ff3e5e';
      ctx.shadowBlur  = 8;
      ctx.beginPath();
      ctx.arc(cx, p.y + p.altura - 1, 3, 0, 2 * Math.PI);
      ctx.fill();
      ctx.shadowBlur = 0;
   },
   buscarParte: function(nome) {
      for (var i = 0; i < this.partes.length; i++) {
         if (this.partes[i].nome == nome) return this.partes[i];
      }
      return null;
   },

   // ---------------------------------------------------------------------
   // Interface de colisão
   // ---------------------------------------------------------------------
   retangulosColisao: function() {
      // Um retângulo para cada parte, já na posição atual da Sentinela
      var retangulos = [];
      for (var i = 0; i < this.partes.length; i++) {
         var p = this.partes[i];
         retangulos.push({
            x: this.x + p.x,
            y: this.y + p.y,
            largura: p.largura,
            altura:  p.altura,
            nome:    p.nome,      // usado para identificar a parte
            rotulo:  p.rotulo     // texto mostrado na tela
         });
      }
      return retangulos;
   },
   colidiuCom: function(outro, meuRetangulo) {
      // Só os lasers causam dano (as bolas apenas quicam)
      if (! (outro instanceof Tiro)) return;

      // Qual retângulo foi atingido? O nome dele diz qual é a parte!
      var parte = this.buscarParte(meuRetangulo.nome);
      parte.atingida = DURACAO_DO_PISCAR;
      parte.acertos++;

      if (this.aoSerAtingida) this.aoSerAtingida(parte, outro);
   }
}
