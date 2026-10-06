/* =========================================================================
   bola.js - Os orbes de plasma (baseado no bola.js do professor)

   REQUISITO 3: quando as duas bolas colidem entre si, AMBAS mudam de cor.
   REQUISITO 4: a cada nova colisão entre as bolas, o jogo é avisado (pela
                função aoBaterEmBola) para contar as colisões.

   O que mudou em relação ao arquivo original:
     - cada bola tem uma lista de cores e passa para a próxima a cada
       colisão com a outra bola (com um anel branco na hora da troca);
     - o Colisor trabalha com retângulos, mas a bola é redonda: nos cantos
       os retângulos se encostam antes dos círculos. Por isso a bola confere
       a distância real entre os centros antes de considerar a batida;
     - enquanto as bolas continuam sobrepostas, o Colisor avisa a colisão a
       cada quadro. Para a mesma batida não ser contada várias vezes, ela só
       vale se as bolas ainda estiverem se APROXIMANDO uma da outra;
     - a bola quica na nave e na Sentinela (sem atravessá-las). Nas bordas,
       se ela passou do limite, é colocada de volta para dentro e a
       velocidade aponta para dentro (Math.abs), para nunca ficar presa.
   ========================================================================= */

function Bola(context) {
   this.context = context;
   this.x = 0;
   this.y = 0;
   this.velocidadeX = 0;
   this.velocidadeY = 0;
   this.raio = 10;
   this.nome = 'bola';

   // Cores que a bola vai assumindo a cada colisão com a outra bola
   this.cores = ['black'];
   this.indiceCor = 0;
   this.cor = this.cores[0];

   this.limiteSuperior = 0;    // a bola não sobe acima desta linha (placar)
   this.brilho = 0;            // anel de destaque logo depois de mudar de cor
   this.frame  = 0;

   // Função avisada a cada NOVA colisão entre duas bolas
   this.aoBaterEmBola = null;
}
Bola.prototype = {
   definirCores: function(cores) {
      this.cores = cores;
      this.indiceCor = 0;
      this.cor = cores[0];
   },
   mudarCor: function() {
      this.indiceCor = (this.indiceCor + 1) % this.cores.length;
      this.cor = this.cores[this.indiceCor];
      this.brilho = 14;
   },

   // ---------------------------------------------------------------------
   // Interface de sprite
   // ---------------------------------------------------------------------
   atualizar: function() {
      var largura = this.context.canvas.width;
      var altura  = this.context.canvas.height;

      this.x += this.velocidadeX;
      this.y += this.velocidadeY;

      // Quicar nas bordas: se a bola passou do limite (andando sozinha ou
      // empurrada pela nave), ela volta para dentro e vai para o outro lado
      if (this.x < this.raio) {
         this.x = this.raio;
         this.velocidadeX = Math.abs(this.velocidadeX);
      }
      else if (this.x > largura - this.raio) {
         this.x = largura - this.raio;
         this.velocidadeX = -Math.abs(this.velocidadeX);
      }

      if (this.y < this.limiteSuperior + this.raio) {
         this.y = this.limiteSuperior + this.raio;
         this.velocidadeY = Math.abs(this.velocidadeY);
      }
      else if (this.y > altura - this.raio) {
         this.y = altura - this.raio;
         this.velocidadeY = -Math.abs(this.velocidadeY);
      }

      this.frame++;
      if (this.brilho > 0) this.brilho--;
   },
   desenhar: function() {
      var ctx = this.context;
      var r   = this.raio;
      ctx.save();

      // Halo pulsante
      var pulso = 0.5 + Math.sin(this.frame * 0.12) * 0.5;
      ctx.globalAlpha = 0.18 + pulso * 0.12;
      ctx.fillStyle = this.cor;
      ctx.beginPath();
      ctx.arc(this.x, this.y, r + 6 + pulso * 3, 0, 2 * Math.PI);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Corpo da bola, com brilho ao redor
      ctx.shadowColor = this.cor;
      ctx.shadowBlur  = 18 + this.brilho;
      ctx.fillStyle   = this.cor;
      ctx.beginPath();
      ctx.arc(this.x, this.y, r, 0, 2 * Math.PI);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Sombra na borda, para dar volume
      var volume = ctx.createRadialGradient(this.x - r * 0.3, this.y - r * 0.3, r * 0.2,
                                            this.x, this.y, r);
      volume.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
      volume.addColorStop(0.45, 'rgba(255, 255, 255, 0)');
      volume.addColorStop(1, 'rgba(5, 7, 15, 0.45)');
      ctx.fillStyle = volume;
      ctx.beginPath();
      ctx.arc(this.x, this.y, r, 0, 2 * Math.PI);
      ctx.fill();

      // Anel branco logo depois de mudar de cor (a cor nova já aparece)
      if (this.brilho > 0) {
         var forca = this.brilho / 14;
         ctx.globalAlpha = forca;
         ctx.strokeStyle = '#ffffff';
         ctx.lineWidth   = 3;
         ctx.beginPath();
         ctx.arc(this.x, this.y, r + 4 + (1 - forca) * 10, 0, 2 * Math.PI);
         ctx.stroke();
      }

      ctx.restore();
   },

   // ---------------------------------------------------------------------
   // Interface de colisão
   // ---------------------------------------------------------------------
   retangulosColisao: function() {
      return [
         {
            x: this.x - this.raio,
            y: this.y - this.raio,
            largura: this.raio * 2,
            altura:  this.raio * 2,
            nome: this.nome
         }
      ];
   },
   colidiuCom: function(outro, meuRetangulo, retanguloDoOutro) {
      if (outro instanceof Bola)
         this.baterEm(outro);
      else if (outro instanceof Nave || outro instanceof Sentinela)
         this.quicarEm(retanguloDoOutro);

      // Tiros e cristais não mudam o movimento da bola
   },

   // ---------------------------------------------------------------------
   // Colisão entre duas bolas (requisitos 3 e 4)
   // ---------------------------------------------------------------------
   baterEm: function(outra) {
      // 1) Os retângulos se cruzaram, mas os CÍRCULOS se tocaram mesmo?
      if (this.distanciaAte(outra) > this.raio + outra.raio) return;

      // 2) As bolas ainda estão se aproximando? Se já estão se afastando,
      //    esta batida já foi tratada (por esta bola ou pela outra)
      if (! this.seAproximaDe(outra)) return;

      // É uma colisão nova! As duas quicam, cada uma para o seu lado...
      this.afastarDe(outra);
      outra.afastarDe(this);

      // ...as duas mudam de cor (REQUISITO 3)...
      this.mudarCor();
      outra.mudarCor();

      // ...e o jogo é avisado, para contar a colisão (REQUISITO 4)
      if (this.aoBaterEmBola) this.aoBaterEmBola(this, outra);
   },
   afastarDe: function(outra) {
      // A mesma regra do colidiuCom() do professor
      if (this.x < outra.x)  // Estou na esquerda
         this.velocidadeX = -Math.abs(this.velocidadeX);  // -
      else
         this.velocidadeX = Math.abs(this.velocidadeX);   // +

      if (this.y < outra.y)  // Estou acima
         this.velocidadeY = -Math.abs(this.velocidadeY);  // -
      else
         this.velocidadeY = Math.abs(this.velocidadeY);   // +
   },
   distanciaAte: function(outra) {
      var dx = outra.x - this.x;
      var dy = outra.y - this.y;
      return Math.sqrt(dx * dx + dy * dy);
   },
   seAproximaDe: function(outra) {
      // Comparamos a distância de agora com a do próximo quadro
      var distanciaAgora = this.distanciaAte(outra);

      var dx = (outra.x + outra.velocidadeX) - (this.x + this.velocidadeX);
      var dy = (outra.y + outra.velocidadeY) - (this.y + this.velocidadeY);
      var distanciaDepois = Math.sqrt(dx * dx + dy * dy);

      return distanciaDepois < distanciaAgora;
   },

   // ---------------------------------------------------------------------
   // Quique em um retângulo (nave e Sentinela)
   // ---------------------------------------------------------------------
   quicarEm: function(ret) {
      var meu = this.retangulosColisao()[0];

      // Quanto um retângulo entrou no outro, na horizontal e na vertical
      var sobraX = Math.min(meu.x + meu.largura, ret.x + ret.largura) -
                   Math.max(meu.x, ret.x);
      var sobraY = Math.min(meu.y + meu.altura, ret.y + ret.altura) -
                   Math.max(meu.y, ret.y);

      var centroX = ret.x + ret.largura / 2;
      var centroY = ret.y + ret.altura / 2;

      // A menor sobreposição indica de que lado foi a batida. A bola vai
      // para o lado de fora e é empurrada para fora do retângulo.
      if (sobraX < sobraY) {
         if (this.x < centroX) {
            this.velocidadeX = -Math.abs(this.velocidadeX);
            this.x -= sobraX;
         }
         else {
            this.velocidadeX = Math.abs(this.velocidadeX);
            this.x += sobraX;
         }
      }
      else {
         if (this.y < centroY) {
            this.velocidadeY = -Math.abs(this.velocidadeY);
            this.y -= sobraY;
         }
         else {
            this.velocidadeY = Math.abs(this.velocidadeY);
            this.y += sobraY;
         }
      }
   }
}
