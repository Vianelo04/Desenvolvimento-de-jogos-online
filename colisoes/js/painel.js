/* =========================================================================
   painel.js - Tudo o que é desenhado por cima do jogo
     - o placar (pontos, cristais, retângulo atingido e o CONTADOR de
       colisões entre as bolas);
     - o contorno dos retângulos de colisão (tecla C);
     - a tela inicial e a tela de GAME OVER (requisito 4).
   O painel só lê o objeto "placar"; quem muda os valores é o jogo.js.
   ========================================================================= */

var ALTURA_DO_PLACAR = 40;

function Painel(context, placar) {
   this.context = context;
   this.placar  = placar;
   this.colisor   = null;   // para desenhar os retângulos de colisão
   this.sentinela = null;   // para o resumo de acertos no Game Over
   this.mostrarRetangulos = true;
   this.frame = 0;
}
Painel.prototype = {
   atualizar: function() {
      this.frame++;
   },
   desenhar: function() {
      var estado = this.placar.estado;

      if (estado == 'inicio') {
         this.desenharTelaInicial();
         return;
      }

      if (this.mostrarRetangulos && this.colisor)
         this.colisor.desenharRetangulos(this.context);

      this.desenharPlacar();

      if (estado == 'fim')
         this.desenharGameOver();
   },

   // ---------------------------------------------------------------------
   // Placar no topo da tela
   // ---------------------------------------------------------------------
   desenharPlacar: function() {
      var ctx     = this.context;
      var largura = ctx.canvas.width;
      var altura  = ctx.canvas.height;
      var placar  = this.placar;

      ctx.save();

      // Faixa do placar
      ctx.fillStyle = 'rgba(5, 10, 31, 0.9)';
      ctx.fillRect(0, 0, largura, ALTURA_DO_PLACAR);
      ctx.strokeStyle = 'rgba(62, 232, 255, 0.45)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, ALTURA_DO_PLACAR + 0.5);
      ctx.lineTo(largura, ALTURA_DO_PLACAR + 0.5);
      ctx.stroke();

      // Títulos
      ctx.font = '10px Verdana, sans-serif';
      ctx.fillStyle = '#7f93b8';
      ctx.fillText('PONTOS', 16, 15);
      ctx.fillText('CRISTAIS', 118, 15);
      ctx.fillText('RETÂNGULO ATINGIDO NA SENTINELA', 214, 15);
      ctx.fillText('COLISÕES ENTRE AS BOLAS', 556, 15);

      // Valores
      ctx.font = 'bold 17px "Trebuchet MS", Verdana, sans-serif';
      ctx.fillStyle = '#eafffb';
      ctx.fillText(('00000' + placar.pontos).slice(-5), 16, 34);
      ctx.fillText(placar.cristais, 118, 34);

      if (placar.ultimaParte) {
         ctx.fillStyle = '#ffd23e';
         ctx.fillText(placar.ultimaParte.rotulo + '  (+' + placar.ultimaParte.pontos + ')',
                      214, 34);
      }
      else {
         ctx.fillStyle = '#55688c';
         ctx.fillText('nenhum ainda', 214, 34);
      }

      // Contador de colisões: uma bolinha acesa para cada colisão
      var perigo = placar.colisoesDasBolas >= placar.limiteDeColisoes - 1;
      for (var i = 0; i < placar.limiteDeColisoes; i++) {
         ctx.beginPath();
         ctx.arc(563 + i * 20, 28, 6.5, 0, 2 * Math.PI);
         if (i < placar.colisoesDasBolas) {
            ctx.fillStyle = '#ff4d6d';
            ctx.fill();
         }
         else {
            ctx.strokeStyle = '#55688c';
            ctx.lineWidth = 1.5;
            ctx.stroke();
         }
      }
      ctx.fillStyle = perigo ? '#ff4d6d' : '#eafffb';
      ctx.fillText(placar.colisoesDasBolas + ' / ' + placar.limiteDeColisoes,
                   563 + placar.limiteDeColisoes * 20, 34);

      // Lembrete da tecla C
      ctx.font = '10px Verdana, sans-serif';
      ctx.fillStyle = 'rgba(159, 180, 214, 0.75)';
      ctx.fillText('[C] retângulos de colisão: ' +
                   (this.mostrarRetangulos ? 'visíveis' : 'ocultos'), 12, altura - 10);

      ctx.restore();
   },

   // ---------------------------------------------------------------------
   // Telas de início e de fim
   // ---------------------------------------------------------------------
   escurecerTela: function(opacidade) {
      var ctx = this.context;
      ctx.fillStyle = 'rgba(5, 7, 15, ' + opacidade + ')';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
   },
   textoCentralizado: function(texto, y, fonte, cor, brilho) {
      var ctx = this.context;
      ctx.font = fonte;
      ctx.fillStyle = cor;
      ctx.textAlign = 'center';
      ctx.shadowColor = cor;
      ctx.shadowBlur  = brilho || 0;
      ctx.fillText(texto, ctx.canvas.width / 2, y);
      ctx.shadowBlur  = 0;
   },
   desenharTelaInicial: function() {
      var ctx = this.context;
      var centro = ctx.canvas.width / 2;

      ctx.save();
      this.escurecerTela(0.45);

      this.textoCentralizado('COLISÃO ORBITAL', 112,
                             'bold 46px "Trebuchet MS", Verdana, sans-serif', '#3ee8ff', 22);
      this.textoCentralizado('AURORA-7  ×  SENTINELA X-9', 146,
                             'bold 15px "Trebuchet MS", Verdana, sans-serif', '#ff3ea5', 0);

      // Quadro com os objetivos
      ctx.fillStyle   = 'rgba(11, 22, 54, 0.85)';
      ctx.strokeStyle = 'rgba(62, 232, 255, 0.5)';
      ctx.lineWidth   = 1.5;
      ctx.fillRect(centro - 290, 170, 580, 160);
      ctx.strokeRect(centro - 290, 170, 580, 160);

      var objetivos = [
         ['#3ee8ff', 'Atire na Sentinela: cada parte dela é um retângulo de colisão.'],
         ['#ffd23e', 'Toque nos cristais com a nave: eles somem e valem pontos.'],
         ['#ff3ea5', 'As duas bolas de plasma mudam de cor sempre que se chocam.'],
         ['#ff4d6d', 'Na 3ª colisão entre as bolas é GAME OVER. Rebata-as com a nave!']
      ];
      ctx.textAlign = 'left';
      ctx.font = '15px "Trebuchet MS", Verdana, sans-serif';
      for (var i = 0; i < objetivos.length; i++) {
         var y = 204 + i * 34;
         ctx.fillStyle = objetivos[i][0];
         ctx.beginPath();                     // marcador em losango
         ctx.moveTo(centro - 262, y - 10);
         ctx.lineTo(centro - 256, y - 5);
         ctx.lineTo(centro - 262, y);
         ctx.lineTo(centro - 268, y - 5);
         ctx.closePath();
         ctx.fill();
         ctx.fillStyle = '#cfe3ff';
         ctx.fillText(objetivos[i][1], centro - 244, y);
      }

      this.textoCentralizado('←  ↑  →  ↓  mover     •     ESPAÇO  atirar     •     C  retângulos de colisão',
                             364, '13px Verdana, sans-serif', '#9fb4d6', 0);

      // "Pressione ENTER" piscando suavemente
      ctx.globalAlpha = 0.7 + 0.3 * Math.sin(this.frame * 0.08);
      this.textoCentralizado('PRESSIONE ENTER PARA COMEÇAR', 418,
                             'bold 19px "Trebuchet MS", Verdana, sans-serif', '#eafffb', 12);
      ctx.restore();
   },
   desenharGameOver: function() {
      var ctx = this.context;
      var placar = this.placar;

      ctx.save();
      this.escurecerTela(0.72);

      this.textoCentralizado('GAME OVER', 178,
                             'bold 68px "Trebuchet MS", Verdana, sans-serif', '#ff4d6d', 28);
      this.textoCentralizado('As bolas de plasma colidiram ' + placar.limiteDeColisoes +
                             ' vezes e o reator entrou em colapso.', 222,
                             '16px "Trebuchet MS", Verdana, sans-serif', '#cfe3ff', 0);
      this.textoCentralizado('Pontuação final: ' + placar.pontos +
                             '     •     Cristais coletados: ' + placar.cristais, 266,
                             'bold 18px "Trebuchet MS", Verdana, sans-serif', '#eafffb', 0);

      // Resumo: quantas vezes cada retângulo da Sentinela foi atingido
      if (this.sentinela) {
         var resumo = [];
         var partes = this.sentinela.partes;
         for (var i = 0; i < partes.length; i++)
            resumo.push(partes[i].rotulo + ': ' + partes[i].acertos);

         this.textoCentralizado('RETÂNGULOS ATINGIDOS NA SENTINELA', 308,
                                '11px Verdana, sans-serif', '#7f93b8', 0);
         this.textoCentralizado(resumo.join('   •   '), 332,
                                'bold 14px "Trebuchet MS", Verdana, sans-serif', '#ffd23e', 0);
      }

      this.textoCentralizado('Pressione ENTER para jogar novamente', 392,
                             'bold 17px "Trebuchet MS", Verdana, sans-serif', '#3ee8ff', 10);
      ctx.restore();
   }
}
