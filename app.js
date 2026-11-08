/**
 * ============================================================================
 * Jogo da Velha — Solução MVC com Bot (IA) e Seleção de Modo
 * ============================================================================
 */

'use strict';

/**
 * ============================================================================
 * MODEL (GameModel)
 * ============================================================================
 */
class GameModel {
  static WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Linhas
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colunas
    [0, 4, 8], [2, 4, 6]             // Diagonais
  ];

  constructor() {
    this.board = Array(9).fill(null);
    this.currentPlayer = 'X';
    this.isGameOver = false;
    this.winner = null;
    this.winningCombo = null;

    // Configurações do modo de jogo
    this.gameMode = 'bot';        // 'bot' (Humano vs Bot) ou 'pvp' (Humano vs Humano)
    this.botDifficulty = 'hard';  // 'easy', 'medium', 'hard' (Minimax)
    this.botPlayer = 'O';         // Bot joga como 'O'

    this.scores = {
      X: 0,
      O: 0,
      draws: 0
    };
  }

  makeMove(index) {
    if (this.isGameOver) return { success: false, reason: 'GAME_OVER' };
    if (index < 0 || index > 8) return { success: false, reason: 'INVALID_INDEX' };
    if (this.board[index] !== null) return { success: false, reason: 'OCCUPIED' };

    this.board[index] = this.currentPlayer;

    const winCombo = this.checkWin(this.board, this.currentPlayer);
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

    if (this.checkDraw(this.board)) {
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

    this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';

    return {
      success: true,
      nextPlayer: this.currentPlayer
    };
  }

  checkWin(board, player) {
    for (const combo of GameModel.WINNING_COMBINATIONS) {
      const [a, b, c] = combo;
      if (board[a] === player && board[b] === player && board[c] === player) {
        return combo;
      }
    }
    return null;
  }

  checkDraw(board) {
    return board.every(cell => cell !== null);
  }

  /**
   * Lógica da Inteligência Artificial do Bot
   */
  getBotMove() {
    const emptyIndices = this.board
      .map((val, idx) => (val === null ? idx : null))
      .filter(val => val !== null);

    if (emptyIndices.length === 0) return null;

    // Dificuldade Fácil: Escolha puramente aleatória
    if (this.botDifficulty === 'easy') {
      return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    }

    // Dificuldade Média: 50% Minimax / 50% Aleatório
    if (this.botDifficulty === 'medium') {
      if (Math.random() > 0.5) {
        return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
      }
    }

    // Dificuldade Difícil (Impossível de vencer): Algoritmo Minimax
    return this.getBestMoveMinimax();
  }

  getBestMoveMinimax() {
    let bestScore = -Infinity;
    let bestMove = null;

    for (let i = 0; i < 9; i++) {
      if (this.board[i] === null) {
        this.board[i] = this.botPlayer;
        let score = this.minimax(this.board, 0, false);
        this.board[i] = null;

        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }
    return bestMove;
  }

  minimax(board, depth, isMaximizing) {
    const humanPlayer = this.botPlayer === 'X' ? 'O' : 'X';

    if (this.checkWin(board, this.botPlayer)) return 10 - depth;
    if (this.checkWin(board, humanPlayer)) return depth - 10;
    if (this.checkDraw(board)) return 0;

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = this.botPlayer;
          let evaluation = this.minimax(board, depth + 1, false);
          board[i] = null;
          maxEval = Math.max(maxEval, evaluation);
        }
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = humanPlayer;
          let evaluation = this.minimax(board, depth + 1, true);
          board[i] = null;
          minEval = Math.min(minEval, evaluation);
        }
      }
      return minEval;
    }
  }

  resetBoard() {
    this.board = Array(9).fill(null);
    this.currentPlayer = 'X';
    this.isGameOver = false;
    this.winner = null;
    this.winningCombo = null;
  }

  resetScores() {
    this.scores = { X: 0, O: 0, draws: 0 };
    this.resetBoard();
  }
}

/**
 * ============================================================================
 * VIEW (GameView)
 * ============================================================================
 */
class GameView {
  constructor() {
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

    // Referências corretas para os botões de seleção de modo
    this.btnModeBot = document.getElementById('btnModeBot');
    this.btnModePvp = document.getElementById('btnModePvp');

    this.audioContext = null;
  }

  setActiveMode(mode) {
    if (!this.btnModeBot || !this.btnModePvp) return;
    if (mode === 'bot') {
      this.btnModeBot.classList.add('active');
      this.btnModeBot.setAttribute('aria-pressed', 'true');
      this.btnModePvp.classList.remove('active');
      this.btnModePvp.setAttribute('aria-pressed', 'false');
    } else {
      this.btnModePvp.classList.add('active');
      this.btnModePvp.setAttribute('aria-pressed', 'true');
      this.btnModeBot.classList.remove('active');
      this.btnModeBot.setAttribute('aria-pressed', 'false');
    }
  }

  bindModeChange(handler) {
    if (this.btnModeBot && this.btnModePvp) {
      this.btnModeBot.addEventListener('click', () => handler('bot'));
      this.btnModePvp.addEventListener('click', () => handler('pvp'));
    }
  }

  renderBoard(board, winningCombo = null, isGameOver = false) {
    this.cellElements.forEach((cell, index) => {
      const mark = board[index];
      const row = cell.getAttribute('data-row');
      const col = cell.getAttribute('data-col');

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

      if (winningCombo && winningCombo.includes(index)) {
        cell.classList.add('winning-cell');
      } else {
        cell.classList.remove('winning-cell');
      }
    });

    if (isGameOver) {
      this.boardGrid.classList.add('game-over');
    } else {
      this.boardGrid.classList.remove('game-over');
    }
  }

  renderScores(scores) {
    this.scoreX.textContent = String(scores.X);
    this.scoreDraw.textContent = String(scores.draws);
    this.scoreO.textContent = String(scores.O);
  }

  renderStatus(text, statusClass) {
    this.statusBanner.textContent = text;
    this.statusBanner.className = `status-banner ${statusClass}`;
  }

  triggerInvalidFeedback(index) {
    const cell = this.cellElements[index];
    if (!cell) return;

    cell.classList.remove('shake');
    void cell.offsetWidth;
    cell.classList.add('shake');

    cell.addEventListener(
      'animationend',
      () => cell.classList.remove('shake'),
      { once: true }
    );

    this.playSubtleAlertSound();
  }

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
      // Falha silenciosa
    }
  }

  openConfirmModal() {
    if (typeof this.confirmDialog.showModal === 'function') {
      this.confirmDialog.showModal();
    } else {
      if (window.confirm('Tem certeza de que deseja zerar todas as pontuações acumuladas?')) {
        this.btnConfirmReset.click();
      }
    }
  }

  closeConfirmModal() {
    if (this.confirmDialog.open) {
      this.confirmDialog.close();
    }
  }

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

  bindNewGame(handler) {
    this.btnNewGame.addEventListener('click', handler);
  }

  bindResetScores(handler) {
    this.btnResetScores.addEventListener('click', handler);
  }

  bindConfirmReset(handler) {
    this.btnConfirmReset.addEventListener('click', handler);
  }

  bindCancelReset(handler) {
    this.btnCancelReset.addEventListener('click', handler);
  }
}

/**
 * ============================================================================
 * CONTROLLER (GameController)
 * ============================================================================
 */
class GameController {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.isBotThinking = false;

    // Bindings de eventos organizados dentro do construtor
    this.view.bindCellClick(this.handleCellClick.bind(this));
    this.view.bindNewGame(this.handleNewGame.bind(this));
    this.view.bindResetScores(this.handleOpenResetModal.bind(this));
    this.view.bindConfirmReset(this.handleConfirmReset.bind(this));
    this.view.bindCancelReset(this.handleCancelReset.bind(this));
    this.view.bindModeChange(this.handleModeChange.bind(this));

    this.init();
  }

  init() {
    this.view.renderBoard(this.model.board, null, false);
    this.view.renderScores(this.model.scores);
    this.view.renderStatus('Vez do Jogador X', 'status-x');
    this.view.setActiveMode(this.model.gameMode);
  }

  handleCellClick(index) {
    if (this.isBotThinking) return;
    this.executeMove(index);
  }

  executeMove(index) {
    const result = this.model.makeMove(index);

    if (result.success) {
      if (result.isWin) {
        this.view.renderBoard(this.model.board, result.winningCombo, true);
        this.view.renderScores(result.scores);
        const winnerName = (this.model.gameMode === 'bot' && result.winner === this.model.botPlayer) 
          ? 'Bot (O)' 
          : `Jogador ${result.winner}`;
        this.view.renderStatus(`Vitória do ${winnerName}! 🎉`, 'status-win');
      } else if (result.isDraw) {
        this.view.renderBoard(this.model.board, null, true);
        this.view.renderScores(result.scores);
        this.view.renderStatus('Partida empatada! 🤝', 'status-draw');
      } else {
        this.view.renderBoard(this.model.board, null, false);
        const statusClass = result.nextPlayer === 'X' ? 'status-x' : 'status-o';
        
        const turnText = (this.model.gameMode === 'bot' && result.nextPlayer === this.model.botPlayer)
          ? 'Bot está pensando...'
          : `Vez do Jogador ${result.nextPlayer}`;

        this.view.renderStatus(turnText, statusClass);

        if (this.model.gameMode === 'bot' && result.nextPlayer === this.model.botPlayer && !this.model.isGameOver) {
          this.triggerBotTurn();
        }
      }
    } else {
      if (result.reason === 'OCCUPIED') {
        this.view.triggerInvalidFeedback(index);
      }
    }
  }

  triggerBotTurn() {
    this.isBotThinking = true;

    setTimeout(() => {
      const botMove = this.model.getBotMove();
      this.isBotThinking = false;

      if (botMove !== null) {
        this.executeMove(botMove);
      }
    }, 400);
  }

  handleModeChange(mode) {
    this.model.gameMode = mode;
    this.view.setActiveMode(mode);
    this.handleNewGame();
  }

  handleNewGame() {
    this.isBotThinking = false;
    this.model.resetBoard();
    this.view.renderBoard(this.model.board, null, false);
    this.view.renderStatus('Vez do Jogador X', 'status-x');
  }

  handleOpenResetModal() {
    this.view.openConfirmModal();
  }

  handleConfirmReset() {
    this.isBotThinking = false;
    this.view.closeConfirmModal();
    this.model.resetScores();
    this.view.renderScores(this.model.scores);
    this.view.renderBoard(this.model.board, null, false);
    this.view.renderStatus('Vez do Jogador X', 'status-x');
  }

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

  window.gameApp = app;
});