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
    this.botDifficulty = 'medium';  // 'easy', 'medium', 'hard' (Minimax)
    this.botPlayer = 'O';         // Bot joga como 'O'

    this.lives = { X: 3, O: 3 };
    this.round = 1;
    this.startingPlayer = 'X';
    this.duelWinner = null;

    this.scores = {
      X: 0,
      O: 0,
      draws: 0
    };
  }

  makeMove(index) {
    if (this.isGameOver || this.duelWinner) return { success: false, reason: 'GAME_OVER' };
    if (!Number.isInteger(index) || index < 0 || index > 8) return { success: false, reason: 'INVALID_INDEX' };
    if (this.board[index] !== null) return { success: false, reason: 'OCCUPIED' };

    this.board[index] = this.currentPlayer;

    const winCombo = this.checkWin(this.board, this.currentPlayer);
    if (winCombo) {
      this.isGameOver = true;
      this.winner = this.currentPlayer;
      this.winningCombo = winCombo;
      this.scores[this.currentPlayer] += 1;
      const loser = this.currentPlayer === 'X' ? 'O' : 'X';
      this.lives[loser] -= 1;
      if (this.lives[loser] === 0) this.duelWinner = this.currentPlayer;

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
    if (this.isGameOver || this.duelWinner) return null;
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
    this.currentPlayer = this.startingPlayer || 'X';
    this.isGameOver = false;
    this.winner = null;
    this.winningCombo = null;
  }

  nextRound() {
    if (!this.isGameOver || this.duelWinner) return false;
    this.round += 1;
    this.startingPlayer = this.startingPlayer === 'X' ? 'O' : 'X';
    this.resetBoard();
    return true;
  }

  resetDuel() {
    this.lives = { X: 3, O: 3 };
    this.scores = { X: 0, O: 0, draws: 0 };
    this.round = 1;
    this.startingPlayer = 'X';
    this.duelWinner = null;
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

    this.difficulty = document.getElementById('botDifficulty');
    this.difficultySection = document.getElementById('difficultySection');
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
      cell.disabled = isGameOver;
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

  renderDuel(model) {
    document.getElementById('roundNumber').textContent = `Rodada ${model.round}`;
    for (const player of ['X', 'O']) {
      document.getElementById(`name${player}`).textContent =
        model.gameMode === 'bot' && player === model.botPlayer ? 'Bot (O)' : `Jogador ${player}`;
      document.getElementById(`lives${player}`).textContent = `${model.lives[player]} de 3 vidas`;
      const losses = 3 - model.lives[player];
      document.querySelectorAll(`#hangman${player} [data-stage]`).forEach(part => {
        part.style.visibility = Number(part.dataset.stage) <= losses ? 'visible' : 'hidden';
      });
    }
    this.difficultySection.hidden = model.gameMode !== 'bot';
    this.difficulty.value = model.botDifficulty;
    this.btnNewGame.textContent = model.duelWinner ? 'Jogar revanche' : 'Próxima rodada';
    this.btnNewGame.disabled = !model.isGameOver;
    this.btnResetScores.textContent = 'Novo duelo';
    this.renderScores(model.scores);
  }

  bindDifficultyChange(handler) {
    this.difficulty.addEventListener('change', () => handler(this.difficulty.value));
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
      if (window.confirm('Iniciar um novo duelo? As vidas e o placar serão reiniciados.')) {
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
    this.botTimer = null;

    // Bindings de eventos organizados dentro do construtor
    this.view.bindCellClick(this.handleCellClick.bind(this));
    this.view.bindNewGame(this.handleNewGame.bind(this));
    this.view.bindResetScores(this.handleOpenResetModal.bind(this));
    this.view.bindConfirmReset(this.handleConfirmReset.bind(this));
    this.view.bindCancelReset(this.handleCancelReset.bind(this));
    this.view.bindModeChange(this.handleModeChange.bind(this));

    this.view.bindDifficultyChange(this.handleDifficultyChange.bind(this));
    this.init();
  }

  init() {
    this.view.setActiveMode(this.model.gameMode);
    this.render();
    this.updateTurn();
  }

  playerName(player) {
    return this.model.gameMode === 'bot' && player === this.model.botPlayer
      ? 'Bot (O)' : `Jogador ${player}`;
  }

  render() {
    this.view.renderBoard(this.model.board, this.model.winningCombo, this.model.isGameOver);
    this.view.renderDuel(this.model);
  }

  updateTurn() {
    const botTurn = this.model.gameMode === 'bot' && this.model.currentPlayer === this.model.botPlayer;
    this.view.renderStatus(botTurn ? 'Bot está pensando...' : `Vez do ${this.playerName(this.model.currentPlayer)}`,
      this.model.currentPlayer === 'X' ? 'status-x' : 'status-o');
    if (botTurn) this.triggerBotTurn();
  }

  handleCellClick(index) {
    if (this.isBotThinking || (this.model.gameMode === 'bot' && this.model.currentPlayer === this.model.botPlayer)) return;
    this.executeMove(index);
  }

  executeMove(index) {
    const result = this.model.makeMove(index);
    if (!result.success) {
      if (result.reason === 'OCCUPIED') this.view.triggerInvalidFeedback(index);
      return;
    }
    this.render();
    if (this.model.duelWinner) {
      this.view.renderStatus(`${this.playerName(this.model.duelWinner)} venceu o duelo!`, 'status-win');
    } else if (result.isWin) {
      const loser = result.winner === 'X' ? 'O' : 'X';
      this.view.renderStatus(`${this.playerName(result.winner)} venceu a rodada! ${this.playerName(loser)} perdeu uma vida.`, 'status-win');
    } else if (result.isDraw) {
      this.view.renderStatus('Empate! Ninguém perdeu vida.', 'status-draw');
    } else {
      this.updateTurn();
    }
  }

  cancelBotTurn() {
    clearTimeout(this.botTimer);
    this.botTimer = null;
    this.isBotThinking = false;
  }

  triggerBotTurn() {
    this.cancelBotTurn();
    this.isBotThinking = true;
    this.botTimer = setTimeout(() => {
      this.botTimer = null;
      this.isBotThinking = false;
      if (this.model.gameMode !== 'bot' || this.model.currentPlayer !== this.model.botPlayer || this.model.isGameOver) return;
      const move = this.model.getBotMove();
      if (move !== null) this.executeMove(move);
    }, 400);
  }

  handleModeChange(mode) {
    if (!['bot', 'pvp'].includes(mode) || mode === this.model.gameMode) return;
    this.model.gameMode = mode;
    this.restartDuel();
  }

  handleDifficultyChange(difficulty) {
    if (!['easy', 'medium', 'hard'].includes(difficulty)) return;
    this.model.botDifficulty = difficulty;
    this.restartDuel();
  }

  restartDuel() {
    this.cancelBotTurn();
    this.model.resetDuel();
    this.init();
  }

  handleNewGame() {
    if (this.model.duelWinner) {
      this.restartDuel();
    } else if (this.model.nextRound()) {
      this.cancelBotTurn();
      this.render();
      this.updateTurn();
    }
  }

  handleOpenResetModal() {
    this.view.openConfirmModal();
  }

  handleConfirmReset() {
    this.view.closeConfirmModal();
    this.restartDuel();
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
