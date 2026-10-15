/**
 * ============================================================================
 * Jogo da Velha — Solução MVC (Engenharia de Software)
 * ============================================================================
 * 
 * Implementação 100% Baunilha (Vanilla ES2020) atendendo a todos os:
 * - Requisitos Funcionais: RF01 a RF08
 * - Requisitos Não Funcionais: RNF01 a RNF07
 * - Regras de Negócio: RN01 a RN07
 * - Casos de Teste Homologados: CT01 a CT10
 * - Rubrica Pedagógica: Separação estrita Model-View-Controller, 0% innerHTML
 * ============================================================================
 */

'use strict';

/**
 * ============================================================================
 * MODEL (GameModel)
 * ============================================================================
 * Responsável pelo estado do jogo, armazenamento de dados e regras de negócio.
 * Não possui NENHUM conhecimento sobre o DOM ou a interface gráfica (RNF06).
 */
class GameModel {
  /**
   * 8 Combinações clássicas de vitória: 3 linhas, 3 colunas e 2 diagonais.
   * Atende ao RF05 e RN03.
   */
  static WINNING_COMBINATIONS = [
    [0, 1, 2], // Linha 1
    [3, 4, 5], // Linha 2
    [6, 7, 8], // Linha 3
    [0, 3, 6], // Coluna 1
    [1, 4, 7], // Coluna 2
    [2, 5, 8], // Coluna 3
    [0, 4, 8], // Diagonal Principal
    [2, 4, 6]  // Diagonal Secundária
  ];

  constructor() {
    /** @type {Array<string|null>} Tabuleiro de 9 posições inicializado com null */
    this.board = Array(9).fill(null);

    /** @type {'X'|'O'} Jogador inicial é estritamente 'X' (RN01) */
    this.currentPlayer = 'X';

    /** @type {boolean} Flag de bloqueio pós-vitória ou empate (RN04) */
    this.isGameOver = false;

    /** @type {'X'|'O'|'draw'|null} */
    this.winner = null;

    /** @type {number[]|null} Índices das casas vitoriosas */
    this.winningCombo = null;

    /** @type {{ X: number, O: number, draws: number }} Placar acumulado da sessão (RF07, RN06) */
    this.scores = {
      X: 0,
      O: 0,
      draws: 0
    };
  }

  /**
   * Executa a tentativa de jogada na casa solicitada.
   * @param {number} index Índice da célula (0 a 8)
   * @returns {{
   *   success: boolean,
   *   reason?: 'OCCUPIED' | 'GAME_OVER' | 'INVALID_INDEX',
   *   isWin?: boolean,
   *   isDraw?: boolean,
   *   winner?: 'X'|'O'|'draw'|null,
   *   winningCombo?: number[]|null,
   *   nextPlayer?: 'X'|'O',
   *   scores?: { X: number, O: number, draws: number }
   * }}
   */
  makeMove(index) {
    // RN04 / CT06: Tabuleiro bloqueado contra jogadas após fim de jogo
    if (this.isGameOver) {
      return { success: false, reason: 'GAME_OVER' };
    }

    // Validação de limite de índice
    if (index < 0 || index > 8) {
      return { success: false, reason: 'INVALID_INDEX' };
    }

    // RN02 / RF04 / CT05: Célula já ocupada
    if (this.board[index] !== null) {
      return { success: false, reason: 'OCCUPIED' };
    }

    // RF02: Registrar a marcação
    this.board[index] = this.currentPlayer;

    // RF05 / RN03: Checar se houve vitória imediata
    const winCombo = this.checkWin();
    if (winCombo) {
      this.isGameOver = true;
      this.winner = this.currentPlayer;
      this.winningCombo = winCombo;
      this.scores[this.currentPlayer] += 1;

      return {
        success: true,
        isWin: true,
        winner: this.winner,
        winningCombo: this.winningCombo,
        scores: { ...this.scores }
      };
    }

    // RF05 / RN05: Checar se houve empate ("Velha")
    if (this.checkDraw()) {
      this.isGameOver = true;
      this.winner = 'draw';
      this.winningCombo = null;
      this.scores.draws += 1;

      return {
        success: true,
        isDraw: true,
        winner: 'draw',
        scores: { ...this.scores }
      };
    }

    // RF03: Alternar jogador ativo se o jogo continua
    this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';

    return {
      success: true,
      nextPlayer: this.currentPlayer
    };
  }

  /**
   * Avalia as 8 combinações de vitória.
   * @returns {number[]|null} A trinca vitoriosa ou null
   */
  checkWin() {
    for (const combo of GameModel.WINNING_COMBINATIONS) {
      const [a, b, c] = combo;
      if (
        this.board[a] &&
        this.board[a] === this.board[b] &&
        this.board[a] === this.board[c]
      ) {
        return combo;
      }
    }
    return null;
  }

  /**
   * Avalia se todas as 9 posições foram preenchidas sem trinca (RN05).
   * @returns {boolean}
   */
  checkDraw() {
    return this.board.every(cell => cell !== null);
  }

  /**
   * Reinicia apenas o tabuleiro para uma nova partida.
   * Preserva rigorosamente o histórico do placar (RF06, RN06).
   */
  resetBoard() {
    this.board = Array(9).fill(null);
    this.currentPlayer = 'X'; // RN01: Jogador X sempre recomeça
    this.isGameOver = false;
    this.winner = null;
    this.winningCombo = null;
  }

  /**
   * Redefine o placar para zero e reinicia o tabuleiro (RF08, RN07, CT08).
   */
  resetScores() {
    this.scores = { X: 0, O: 0, draws: 0 };
    this.resetBoard();
  }
}

/**
 * ============================================================================
 * VIEW (GameView)
 * ============================================================================
 * Responsável pela manipulação do DOM, renderização visual, acessibilidade
 * e captura de eventos da interface.
 * Não contém regras de negócio ou cálculos de vitória (RNF06).
 */
class GameView {
  constructor() {
    // Cache de referências de elementos da interface
    this.boardGrid = document.getElementById('boardGrid');
    this.cellElements = Array.from(document.querySelectorAll('.cell'));
    this.statusBanner = document.getElementById('gameStatus');

    this.scoreX = document.getElementById('scoreX');
    this.scoreDraw = document.getElementById('scoreDraw');
    this.scoreO = document.getElementById('scoreO');

    this.btnNewGame = document.getElementById('btnNewGame');
    this.btnResetScores = document.getElementById('btnResetScores');

    this.confirmDialog = document.getElementById('confirmDialog');
    this.btnConfirmReset = document.getElementById('btnConfirmReset');
    this.btnCancelReset = document.getElementById('btnCancelReset');

    // Contexto de áudio sintético para o alerta de jogada inválida (CT05)
    this.audioContext = null;
  }

  /**
   * Atualiza a renderização de todas as 9 células de forma 100% segura (sem innerHTML).
   * Atualiza simultaneamente o texto visual e os rótulos dinâmicos aria-label (RNF05).
   * @param {Array<string|null>} board
   * @param {number[]|null} winningCombo
   * @param {boolean} isGameOver
   */
  renderBoard(board, winningCombo = null, isGameOver = false) {
    this.cellElements.forEach((cell, index) => {
      const mark = board[index];
      const row = cell.getAttribute('data-row');
      const col = cell.getAttribute('data-col');

      // Manipulação segura de texto via textContent (sem innerHTML)
      cell.textContent = mark ? mark : '';

      if (mark) {
        cell.setAttribute('data-mark', mark);
        cell.classList.add('cell-occupied');
        cell.setAttribute('aria-label', `Linha ${row}, Coluna ${col}: Jogador ${mark}`);
      } else {
        cell.removeAttribute('data-mark');
        cell.classList.remove('cell-occupied');
        cell.setAttribute('aria-label', `Linha ${row}, Coluna ${col}, vazia`);
      }

      // Realce da trinca vencedora (CT01, CT02, CT03)
      if (winningCombo && winningCombo.includes(index)) {
        cell.classList.add('winning-cell');
      } else {
        cell.classList.remove('winning-cell');
      }
    });

    // Classe geral para indicar encerramento no tabuleiro
    if (isGameOver) {
      this.boardGrid.classList.add('game-over');
    } else {
      this.boardGrid.classList.remove('game-over');
    }
  }

  /**
   * Atualiza o painel de placar.
   * @param {{ X: number, O: number, draws: number }} scores
   */
  renderScores(scores) {
    this.scoreX.textContent = String(scores.X);
    this.scoreDraw.textContent = String(scores.draws);
    this.scoreO.textContent = String(scores.O);
  }

  /**
   * Atualiza o banner de status com aria-live polite (RNF05).
   * @param {string} text Texto explicativo do turno ou término
   * @param {'status-x'|'status-o'|'status-win'|'status-draw'} statusClass Classe visual
   */
  renderStatus(text, statusClass) {
    this.statusBanner.textContent = text;
    this.statusBanner.className = `status-banner ${statusClass}`;
  }

  /**
   * Emite feedback sonoro e visual ao tentar marcar casa ocupada (RF04, CT05).
   * @param {number} index Índice da célula clicada
   */
  triggerInvalidFeedback(index) {
    const cell = this.cellElements[index];
    if (!cell) return;

    // Efeito visual de tremor (shake)
    cell.classList.remove('shake');
    // Forçar reflow para reiniciar animação CSS se clicado repetidamente
    void cell.offsetWidth;
    cell.classList.add('shake');

    cell.addEventListener(
      'animationend',
      () => cell.classList.remove('shake'),
      { once: true }
    );

    // Efeito sonoro sutil e autônomo via Web Audio API (sem arquivos externos)
    this.playSubtleAlertSound();
  }

  /**
   * Gera um som de alerta sutil usando a Web Audio API pura (RNF07 - 100% offline).
   */
  playSubtleAlertSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      if (!this.audioContext) {
        this.audioContext = new AudioCtx();
      }

      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(180, this.audioContext.currentTime);

      gainNode.gain.setValueAtTime(0.06, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + 0.15);

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.15);
    } catch {
      // Falha silenciosa em ambientes sem suporte a Web Audio
    }
  }

  /**
   * Abre o diálogo modal de confirmação para zerar placar (RF08, RN07).
   */
  openConfirmModal() {
    if (typeof this.confirmDialog.showModal === 'function') {
      this.confirmDialog.showModal();
    } else {
      // Fallback para navegadores muito antigos
      if (window.confirm('Tem certeza de que deseja zerar todas as pontuações acumuladas?')) {
        this.btnConfirmReset.click();
      }
    }
  }

  /**
   * Fecha o diálogo modal de confirmação.
   */
  closeConfirmModal() {
    if (this.confirmDialog.open) {
      this.confirmDialog.close();
    }
  }

  /**
   * Associa evento de clique ou acionamento por teclado nas células.
   * @param {function(number): void} handler
   */
  bindCellClick(handler) {
    this.boardGrid.addEventListener('click', event => {
      const target = event.target.closest('.cell');
      if (!target) return;

      const index = parseInt(target.getAttribute('data-index'), 10);
      if (!isNaN(index)) {
        handler(index);
      }
    });
  }

  /**
   * Associa evento do botão "Nova Partida".
   * @param {function(): void} handler
   */
  bindNewGame(handler) {
    this.btnNewGame.addEventListener('click', handler);
  }

  /**
   * Associa evento do botão "Zerar Placar".
   * @param {function(): void} handler
   */
  bindResetScores(handler) {
    this.btnResetScores.addEventListener('click', handler);
  }

  /**
   * Associa confirmação do modal de exclusão.
   * @param {function(): void} handler
   */
  bindConfirmReset(handler) {
    this.btnConfirmReset.addEventListener('click', handler);
  }

  /**
   * Associa cancelamento do modal de exclusão.
   * @param {function(): void} handler
   */
  bindCancelReset(handler) {
    this.btnCancelReset.addEventListener('click', handler);
  }
}

/**
 * ============================================================================
 * CONTROLLER (GameController)
 * ============================================================================
 * Media a interação entre o Model e a View.
 * Trata os eventos do usuário, executa regras de negócio no Model
 * e comanda a atualização do DOM na View (RNF06).
 */
class GameController {
  /**
   * @param {GameModel} model
   * @param {GameView} view
   */
  constructor(model, view) {
    this.model = model;
    this.view = view;

    // Vincular os ouvintes de eventos da View
    this.view.bindCellClick(this.handleCellClick.bind(this));
    this.view.bindNewGame(this.handleNewGame.bind(this));
    this.view.bindResetScores(this.handleOpenResetModal.bind(this));
    this.view.bindConfirmReset(this.handleConfirmReset.bind(this));
    this.view.bindCancelReset(this.handleCancelReset.bind(this));

    // Inicialização da interface
    this.init();
  }

  /**
   * Inicializa o estado visual inicial da aplicação.
   */
  init() {
    this.view.renderBoard(this.model.board, null, false);
    this.view.renderScores(this.model.scores);
    this.view.renderStatus('Vez do Jogador X', 'status-x');
  }

  /**
   * Trata o clique/acionamento em uma célula do tabuleiro.
   * @param {number} index
   */
  handleCellClick(index) {
    const result = this.model.makeMove(index);

    if (result.success) {
      if (result.isWin) {
        // CT01, CT02, CT03: Vitória detectada
        this.view.renderBoard(this.model.board, result.winningCombo, true);
        this.view.renderScores(result.scores);
        this.view.renderStatus(`Vitória do Jogador ${result.winner}! 🎉`, 'status-win');
      } else if (result.isDraw) {
        // CT04: Empate / Deu Velha
        this.view.renderBoard(this.model.board, null, true);
        this.view.renderScores(result.scores);
        this.view.renderStatus('Partida empatada! 🤝', 'status-draw');
      } else {
        // Jogada normal bem-sucedida, turno alternado
        this.view.renderBoard(this.model.board, null, false);
        const statusClass = result.nextPlayer === 'X' ? 'status-x' : 'status-o';
        this.view.renderStatus(`Vez do Jogador ${result.nextPlayer}`, statusClass);
      }
    } else {
      // RF04 / CT05: Casa ocupada
      if (result.reason === 'OCCUPIED') {
        this.view.triggerInvalidFeedback(index);
      }
      // CT06: Se GAME_OVER, nada acontece, tabuleiro segue bloqueado
    }
  }

  /**
   * Trata o acionamento de "Nova Partida" (RF06, RN01, RN06, CT07).
   */
  handleNewGame() {
    this.model.resetBoard();
    this.view.renderBoard(this.model.board, null, false);
    this.view.renderStatus('Vez do Jogador X', 'status-x');
  }

  /**
   * Abre o modal de confirmação para zerar o placar (RF08, RN07).
   */
  handleOpenResetModal() {
    this.view.openConfirmModal();
  }

  /**
   * Confirma e executa o reset global do placar (CT08).
   */
  handleConfirmReset() {
    this.view.closeConfirmModal();
    this.model.resetScores();
    this.view.renderScores(this.model.scores);
    this.view.renderBoard(this.model.board, null, false);
    this.view.renderStatus('Vez do Jogador X', 'status-x');
  }

  /**
   * Cancela a operação de zerar placar.
   */
  handleCancelReset() {
    this.view.closeConfirmModal();
  }
}

/**
 * ============================================================================
 * BOOTSTRAP DA APLICAÇÃO
 * ============================================================================
 */
document.addEventListener('DOMContentLoaded', () => {
  const model = new GameModel();
  const view = new GameView();
  const app = new GameController(model, view);

  // Expõe a instância globalmente para inspeção pedagógica ou testes automatizados via console
  window.gameApp = app;
  window.GameModel = GameModel;
  window.GameView = GameView;
  window.GameController = GameController;
});
