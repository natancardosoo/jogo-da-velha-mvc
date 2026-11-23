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
    this.lastMoveIndex = null;
    this.isTiebreakerActive = false;
    this.pendingTiebreaker = false;

    // Configurações do modo de jogo
    this.gameMode = 'bot';        // 'bot' (Humano vs Bot) ou 'pvp' (Humano vs Humano)
    this.botDifficulty = 'medium';  // 'easy', 'medium', 'hard' (Minimax)
    this.botPlayer = 'O';         // Bot joga como 'O'
    this.playerNames = { X: '', O: '' };

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

  getPlayerName(player) {
    if (this.gameMode === 'bot' && player === this.botPlayer) return 'Bot';
    return this.playerNames[player] || `Jogador ${player}`;
  }

  setPlayerName(player, name) {
    if (!['X', 'O'].includes(player)) return;
    if (this.gameMode === 'bot' && player === this.botPlayer) return;
    this.playerNames[player] = name.trim().slice(0, 24);
  }

  makeMove(index) {
    if (this.isGameOver || this.duelWinner) return { success: false, reason: 'GAME_OVER' };
    const maxIndex = this.isTiebreakerActive ? 99 : 8;
    if (!Number.isInteger(index) || index < 0 || index > maxIndex) return { success: false, reason: 'INVALID_INDEX' };
    if (this.board[index] !== null) return { success: false, reason: 'OCCUPIED' };

    this.board[index] = this.currentPlayer;
    this.lastMoveIndex = index;

    const winCombo = this.isTiebreakerActive ? this.checkWin10x10(this.board, this.currentPlayer) : this.checkWin(this.board, this.currentPlayer);
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
        scores: { ...this.scores },
        lastMoveIndex: index
      };
    }

    if (this.checkDraw(this.board)) {
      this.isGameOver = true;
      this.winner = 'draw';
      this.winningCombo = null;
      this.scores.draws += 1;
      if (this.scores.draws >= 2 && !this.isTiebreakerActive) {
        this.pendingTiebreaker = true;
      }

      return {
        success: true,
        isDraw: true,
        winner: 'draw',
        scores: { ...this.scores },
        lastMoveIndex: index
      };
    }

    this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';

    return {
      success: true,
      nextPlayer: this.currentPlayer,
      lastMoveIndex: index
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

  checkWin10x10(board, player) {
    const size = 10;
    const directions = [
      [0, 1],   // horizontal
      [1, 0],   // vertical
      [1, 1],   // diagonal down-right
      [-1, 1]   // diagonal up-right
    ];

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        for (const [dr, dc] of directions) {
          const combo = [];
          let win = true;
          for (let i = 0; i < 5; i++) {
            const nr = r + dr * i;
            const nc = c + dc * i;
            if (nr < 0 || nr >= size || nc < 0 || nc >= size) {
              win = false;
              break;
            }
            const idx = nr * size + nc;
            if (board[idx] !== player) {
              win = false;
              break;
            }
            combo.push(idx);
          }
          if (win) return combo;
        }
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
    if (this.isTiebreakerActive) return this.getBotMove10x10();

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

  getBotMove10x10() {
    const emptyIndices = this.board
      .map((val, idx) => (val === null ? idx : null))
      .filter(val => val !== null);

    if (emptyIndices.length === 0) return null;

    const bot = this.botPlayer;
    const human = bot === 'X' ? 'O' : 'X';

    // 1. Can bot win in 1 move? (4 in a row -> 5)
    const winningMove = this.findWinningOrBlockingMove(bot, 4);
    if (winningMove !== null) return winningMove;

    // 2. Can human win or has 4/3 in a row? Block!
    const blockingMove4 = this.findWinningOrBlockingMove(human, 4);
    if (blockingMove4 !== null) return blockingMove4;

    const blockingMove3 = this.findWinningOrBlockingMove(human, 3);
    if (blockingMove3 !== null) return blockingMove3;

    // 3. Play near existing pieces or center
    const nearPieceMove = this.findNearPieceMove();
    if (nearPieceMove !== null) return nearPieceMove;

    return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  }

  findWinningOrBlockingMove(player, targetCount) {
    const size = 10;
    const directions = [[0, 1], [1, 0], [1, 1], [-1, 1]];

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        for (const [dr, dc] of directions) {
          let count = 0;
          let emptySpots = [];
          let valid = true;

          for (let i = 0; i < 5; i++) {
            const nr = r + dr * i;
            const nc = c + dc * i;
            if (nr < 0 || nr >= size || nc < 0 || nc >= size) {
              valid = false;
              break;
            }
            const idx = nr * size + nc;
            if (this.board[idx] === player) {
              count++;
            } else if (this.board[idx] === null) {
              emptySpots.push(idx);
            } else {
              valid = false;
              break;
            }
          }

          if (valid && count === targetCount && emptySpots.length === (5 - targetCount)) {
            const emptyIdx = emptySpots.find(idx => this.board[idx] === null);
            if (emptyIdx !== undefined) return emptyIdx;
          }
        }
      }
    }
    return null;
  }

  findNearPieceMove() {
    const size = 10;
    const existing = [];
    for (let i = 0; i < 100; i++) {
      if (this.board[i] !== null) existing.push(i);
    }

    if (existing.length === 0) {
      const centerIndices = [44, 45, 54, 55];
      const validCenter = centerIndices.filter(idx => this.board[idx] === null);
      if (validCenter.length > 0) {
        return validCenter[Math.floor(Math.random() * validCenter.length)];
      }
    }

    const candidateSet = new Set();
    for (const idx of existing) {
      const r = Math.floor(idx / size);
      const c = idx % size;
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
            const nIdx = nr * size + nc;
            if (this.board[nIdx] === null) candidateSet.add(nIdx);
          }
        }
      }
    }

    const candidates = Array.from(candidateSet);
    if (candidates.length > 0) {
      return candidates[Math.floor(Math.random() * candidates.length)];
    }
    return null;
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
    const size = this.isTiebreakerActive ? 100 : 9;
    this.board = Array(size).fill(null);
    this.currentPlayer = this.startingPlayer || 'X';
    this.isGameOver = false;
    this.winner = null;
    this.winningCombo = null;
    this.lastMoveIndex = null;
  }

  nextRound() {
    if (!this.isGameOver || this.duelWinner) return false;
    this.round += 1;
    this.startingPlayer = this.startingPlayer === 'X' ? 'O' : 'X';
    if (this.pendingTiebreaker && !this.isTiebreakerActive) {
      this.isTiebreakerActive = true;
      this.pendingTiebreaker = false;
    } else if (this.isTiebreakerActive) {
      this.isTiebreakerActive = false;
    }
    this.resetBoard();
    return true;
  }

  resetDuel() {
    this.lives = { X: 3, O: 3 };
    this.scores = { X: 0, O: 0, draws: 0 };
    this.round = 1;
    this.startingPlayer = 'X';
    this.duelWinner = null;
    this.isTiebreakerActive = false;
    this.pendingTiebreaker = false;
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
    this.gameContainer = document.getElementById('gameApp');
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
    this.playerOField = document.getElementById('playerOField');
    this.audioContext = null;

    this.bindKeyboardNavigation();
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

  createChalkMark(mark, is10x10) {
    const svgWidth = is10x10 ? '32' : '46';
    const svgHeight = is10x10 ? '32' : '46';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 50 50');
    svg.setAttribute('width', svgWidth);
    svg.setAttribute('height', svgHeight);
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke-width', '5');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('class', 'chalk-mark-svg');

    if (mark === 'X') {
      svg.setAttribute('stroke', '#ffe66d');
      const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path1.setAttribute('class', 'chalk-stroke stroke-1');
      path1.setAttribute('d', 'M11 11 Q 25 24 39 39');
      svg.appendChild(path1);

      const tip1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      tip1.setAttribute('class', 'chalk-tip chalk-tip-1');
      tip1.setAttribute('cx', '0');
      tip1.setAttribute('cy', '0');
      tip1.setAttribute('r', '2.5');
      svg.appendChild(tip1);

      const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path2.setAttribute('class', 'chalk-stroke stroke-2');
      path2.setAttribute('d', 'M39 11 Q 25 26 11 39');
      svg.appendChild(path2);

      const tip2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      tip2.setAttribute('class', 'chalk-tip chalk-tip-2');
      tip2.setAttribute('cx', '0');
      tip2.setAttribute('cy', '0');
      tip2.setAttribute('r', '2.5');
      svg.appendChild(tip2);
    } else if (mark === 'O') {
      svg.setAttribute('stroke', '#7bdff2');
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('class', 'chalk-stroke stroke-circle');
      path.setAttribute('d', 'M25 10 C 37 9 42 19 41 25 C 40 33 34 41 25 41 C 15 41 9 32 10 24 C 11 16 16 10 25 10 Z');
      svg.appendChild(path);

      const tip = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      tip.setAttribute('class', 'chalk-tip chalk-tip-circle');
      tip.setAttribute('cx', '0');
      tip.setAttribute('cy', '0');
      tip.setAttribute('r', '2.5');
      svg.appendChild(tip);
    }
    return svg;
  }

  ensureGridCells(count) {
    if (this.cellElements.length === count) return;
    const eraserWipe = document.createElement('div');
    eraserWipe.className = 'eraser-dust-wipe';
    eraserWipe.setAttribute('aria-hidden', 'true');
    this.boardGrid.replaceChildren(eraserWipe);

    if (count === 100) {
      this.boardGrid.classList.add('board-grid-10x10');
      for (let i = 0; i < 100; i++) {
        const r = Math.floor(i / 10) + 1;
        const c = (i % 10) + 1;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'cell';
        btn.setAttribute('data-index', i);
        btn.setAttribute('data-row', r);
        btn.setAttribute('data-col', c);
        btn.setAttribute('aria-label', `Linha ${r}, Coluna ${c}, vazia`);
        this.boardGrid.appendChild(btn);
      }
    } else {
      this.boardGrid.classList.remove('board-grid-10x10');
      const linesSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      linesSvg.setAttribute('class', 'chalk-grid-lines');
      linesSvg.setAttribute('viewBox', '0 0 300 300');
      linesSvg.setAttribute('aria-hidden', 'true');

      const pathsData = [
        'M 18 100 Q 150 97 282 101',
        'M 18 200 Q 150 203 282 199',
        'M 100 18 Q 97 150 101 282',
        'M 200 18 Q 203 150 199 282'
      ];
      pathsData.forEach(d => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('class', 'chalk-line');
        linesSvg.appendChild(path);
      });
      this.boardGrid.appendChild(linesSvg);

      for (let i = 0; i < 9; i++) {
        const r = Math.floor(i / 3) + 1;
        const c = (i % 3) + 1;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'cell';
        btn.setAttribute('data-index', i);
        btn.setAttribute('data-row', r);
        btn.setAttribute('data-col', c);
        btn.setAttribute('aria-label', `Linha ${r}, Coluna ${c}, vazia`);
        this.boardGrid.appendChild(btn);
      }
      if (this.tiebreakerRuleBanner) this.tiebreakerRuleBanner.hidden = true;
    }
    this.cellElements = Array.from(this.boardGrid.querySelectorAll('.cell'));
  }

  bindKeyboardNavigation() {
    this.boardGrid.addEventListener('keydown', event => {
      const target = event.target.closest('.cell');
      if (!target) return;

      const index = parseInt(target.getAttribute('data-index'), 10);
      if (isNaN(index)) return;

      const is10x10 = this.cellElements.length === 100;
      const cols = is10x10 ? 10 : 3;
      const rows = is10x10 ? 10 : 3;
      const r = Math.floor(index / cols);
      const c = index % cols;

      let nextR = r;
      let nextC = c;

      if (event.key === 'ArrowUp') {
        nextR = Math.max(0, r - 1);
        event.preventDefault();
      } else if (event.key === 'ArrowDown') {
        nextR = Math.min(rows - 1, r + 1);
        event.preventDefault();
      } else if (event.key === 'ArrowLeft') {
        nextC = Math.max(0, c - 1);
        event.preventDefault();
      } else if (event.key === 'ArrowRight') {
        nextC = Math.min(cols - 1, c + 1);
        event.preventDefault();
      } else {
        return;
      }

      const nextIndex = nextR * cols + nextC;
      const nextCell = this.cellElements[nextIndex];
      if (nextCell) {
        nextCell.focus();
      }
    });
  }

  renderBoard(board, winningCombo = null, isGameOver = false, lastMoveIndex = null) {
    this.ensureGridCells(board.length);
    const is10x10 = board.length === 100;

    this.cellElements.forEach((cell, index) => {
      const mark = board[index];
      cell.disabled = isGameOver;
      const row = cell.getAttribute('data-row');
      const col = cell.getAttribute('data-col');
      const currentMark = cell.getAttribute('data-mark');

      if (mark === 'X' || mark === 'O') {
        if (currentMark !== mark) {
          cell.replaceChildren(this.createChalkMark(mark, is10x10));
          cell.setAttribute('data-mark', mark);
          cell.classList.add('cell-occupied');
          if (index === lastMoveIndex) {
            cell.classList.add('animate-draw');
          } else {
            cell.classList.remove('animate-draw');
          }
        } else {
          cell.classList.remove('animate-draw');
        }
        cell.setAttribute('aria-label', `Linha ${row}, Coluna ${col}: Jogador ${mark}`);
      } else {
        if (currentMark !== null) {
          cell.replaceChildren();
          cell.removeAttribute('data-mark');
          cell.classList.remove('cell-occupied', 'animate-draw');
        }
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
    const roundBadge = document.getElementById('roundNumber');
    const arenaHeaderBar = document.querySelector('.arena-header-bar');
    let tiebreakerCompactBanner = document.getElementById('tiebreakerCompactBanner');

    if (model.isTiebreakerActive) {
      roundBadge.textContent = 'DESEMPATE';
      roundBadge.classList.add('badge-tiebreaker');
      if (this.gameContainer) this.gameContainer.classList.add('tiebreaker-active');
      document.body.classList.add('tiebreaker-body-active');
      if (!tiebreakerCompactBanner && arenaHeaderBar) {
        tiebreakerCompactBanner = document.createElement('div');
        tiebreakerCompactBanner.id = 'tiebreakerCompactBanner';
        tiebreakerCompactBanner.className = 'tiebreaker-compact-banner';

        const bannerSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        bannerSvg.setAttribute('class', 'banner-icon');
        bannerSvg.setAttribute('viewBox', '0 0 24 24');
        bannerSvg.setAttribute('width', '18');
        bannerSvg.setAttribute('height', '18');
        bannerSvg.setAttribute('fill', 'none');
        bannerSvg.setAttribute('stroke', 'currentColor');
        bannerSvg.setAttribute('stroke-width', '2.5');
        bannerSvg.setAttribute('stroke-linecap', 'round');
        bannerSvg.setAttribute('stroke-linejoin', 'round');
        bannerSvg.setAttribute('aria-hidden', 'true');

        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', '13 2 3 14 12 14 11 22 21 10 12 10 13 2');
        bannerSvg.appendChild(polygon);

        const span = document.createElement('span');
        span.textContent = 'MORTE SÚBITA: Alinhe 5 símbolos para vencer!';

        tiebreakerCompactBanner.replaceChildren(bannerSvg, span);
        arenaHeaderBar.insertBefore(tiebreakerCompactBanner, roundBadge.nextSibling);
      }
    } else {
      roundBadge.textContent = `Rodada ${model.round}`;
      roundBadge.classList.remove('badge-tiebreaker');
      if (this.gameContainer) this.gameContainer.classList.remove('tiebreaker-active');
      document.body.classList.remove('tiebreaker-body-active');
      if (tiebreakerCompactBanner) {
        tiebreakerCompactBanner.remove();
      }
    }
    for (const player of ['X', 'O']) {
      document.getElementById(`name${player}`).textContent = `${model.getPlayerName(player)} (${player})`;
      document.querySelector(`#cardScore${player} .score-label`).textContent = `Vitórias ${model.getPlayerName(player)}`;
      document.getElementById(`lives${player}`).textContent = `${model.lives[player]} de 3 vidas`;
      const losses = 3 - model.lives[player];
      document.querySelectorAll(`#hangman${player} [data-stage]`).forEach(part => {
        part.style.visibility = Number(part.dataset.stage) <= losses ? 'visible' : 'hidden';
      });
    }
    this.difficultySection.hidden = model.gameMode !== 'bot';
    this.playerOField.hidden = model.gameMode === 'bot';
    document.getElementById('playerNameO').disabled = model.gameMode === 'bot';
    this.difficulty.value = model.botDifficulty;
    this.btnNewGame.textContent = model.duelWinner ? 'Jogar revanche' : 'Próxima rodada';
    this.btnNewGame.disabled = !model.isGameOver;
    this.btnResetScores.textContent = 'Novo duelo';
    this.renderScores(model.scores);
  }

  bindDifficultyChange(handler) {
    this.difficulty.addEventListener('change', () => handler(this.difficulty.value));
  }

  bindNameChange(handler) {
    for (const player of ['X', 'O']) {
      document.getElementById(`playerName${player}`).addEventListener('input', event => {
        handler(player, event.target.value);
      });
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

  triggerEraserWipe() {
    if (!this.boardGrid) return;
    this.boardGrid.classList.remove('wiping');
    void this.boardGrid.offsetWidth;
    this.boardGrid.classList.add('wiping');
    setTimeout(() => {
      this.boardGrid.classList.remove('wiping');
    }, 450);
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

  bindDebugSuddenDeath(handler) {
    const btn = document.getElementById('btnDebugSuddenDeath');
    if (btn) {
      btn.addEventListener('click', handler);
    }
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
    this.view.bindDebugSuddenDeath(this.handleDebugSuddenDeath.bind(this));

    this.view.bindDifficultyChange(this.handleDifficultyChange.bind(this));
    this.view.bindNameChange((player, name) => {
      this.model.setPlayerName(player, name);
      this.render();
      this.renderResult(false);
    });
    this.init();
  }

  handleDebugSuddenDeath() {
    console.log('Debug ativado');
    this.cancelBotTurn();
    this.model.isTiebreakerActive = true;
    this.model.pendingTiebreaker = false;
    this.model.isGameOver = false;
    this.model.winner = null;
    this.model.winningCombo = null;
    this.model.currentPlayer = 'X';
    this.model.lastMoveIndex = null;
    this.model.board = Array(100).fill(null);

    for (let i = 0; i < 99; i++) {
      const row = Math.floor(i / 10);
      const col = i % 10;
      this.model.board[i] = ((row + Math.floor(col / 2)) % 2 === 0) ? 'X' : 'O';
    }
    this.model.board[99] = null;

    this.render();
    this.updateTurn(false);

    const lastCell = document.querySelector('.cell[data-index="99"]');
    if (lastCell) {
      lastCell.classList.add('debug-highlight-cell');
      setTimeout(() => {
        lastCell.classList.remove('debug-highlight-cell');
      }, 4000);
    }
  }

  init() {
    this.view.setActiveMode(this.model.gameMode);
    this.render();
    this.updateTurn();
  }

  playerName(player) {
    return this.model.getPlayerName(player);
  }

  render(lastMoveIndex = null) {
    this.view.renderBoard(this.model.board, this.model.winningCombo, this.model.isGameOver, lastMoveIndex !== null ? lastMoveIndex : this.model.lastMoveIndex);
    this.view.renderDuel(this.model);
  }

  updateTurn(scheduleBot = true) {
    const botTurn = this.model.gameMode === 'bot' && this.model.currentPlayer === this.model.botPlayer;
    this.view.renderStatus(botTurn ? 'Bot está pensando...' : `Vez do ${this.playerName(this.model.currentPlayer)}`,
      this.model.currentPlayer === 'X' ? 'status-x' : 'status-o');
    if (botTurn && scheduleBot) this.triggerBotTurn();
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
    this.render(result.lastMoveIndex);
    this.renderResult();
  }

  renderResult(scheduleBot = true) {
    if (this.model.duelWinner) {
      this.view.renderStatus(`${this.playerName(this.model.duelWinner)} venceu o duelo!`, 'status-win');
    } else if (this.model.winner && this.model.winner !== 'draw') {
      const loser = this.model.winner === 'X' ? 'O' : 'X';
      this.view.renderStatus(`${this.playerName(this.model.winner)} venceu a rodada! ${this.playerName(loser)} perdeu uma vida.`, 'status-win');
    } else if (this.model.winner === 'draw') {
      if (this.model.isTiebreakerActive) {
        this.view.renderStatus('Empate na Morte Súbita!', 'status-draw');
        this.triggerEasterEgg();
      } else if (this.model.pendingTiebreaker) {
        this.view.renderStatus('2 Empates! Hora do Desempate: 5 em Linha', 'status-draw');
        this.view.triggerEraserWipe();
      } else {
        this.view.renderStatus('Empate! Ninguém perdeu vida.', 'status-draw');
      }
    } else {
      this.updateTurn(scheduleBot);
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
    this.view.triggerEraserWipe();
    this.init();
  }

  handleNewGame() {
    if (this.model.duelWinner) {
      this.restartDuel();
    } else if (this.model.nextRound()) {
      this.cancelBotTurn();
      this.view.triggerEraserWipe();
      this.render(null);
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

  triggerEasterEgg() {
    this.cancelBotTurn();
    const overlay = document.getElementById('easterEggOverlay');
    const msg = document.getElementById('easterEggMessage');
    const videoContainer = document.getElementById('easterEggVideoContainer');
    const video = document.getElementById('easterEggVideo');
    const btnWakeUp = document.getElementById('btnWakeUp');
    const btnExit = document.getElementById('btnExitEasterEgg');
    
    if (!overlay) return;

    let announcer = document.getElementById('screenReaderAnnouncer');
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'screenReaderAnnouncer';
      announcer.setAttribute('aria-live', 'assertive');
      announcer.style.position = 'absolute';
      announcer.style.left = '-9999px';
      document.body.appendChild(announcer);
    }
    announcer.textContent = 'Easter egg desbloqueado: você empatou a morte súbita!';

    overlay.hidden = false;
    overlay.setAttribute('aria-hidden', 'false');

    if (msg) {
      msg.hidden = false;
      msg.classList.remove('fade-out');
      msg.textContent = 'Empate até na Morte Súbita?! Você quebrou o sistema...';
    }
    if (videoContainer) {
      videoContainer.hidden = false;
      videoContainer.classList.remove('visible');
    }
    if (video) {
      video.style.display = 'none';
      video.style.opacity = '0';
    }
    if (btnExit) btnExit.classList.remove('visible');
    if (btnWakeUp) btnWakeUp.style.display = 'none';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fadeDuration = prefersReducedMotion ? 0 : 3000;
    const textVisibleTime = prefersReducedMotion ? 0 : (fadeDuration + 2000);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.classList.add('active');
        if (prefersReducedMotion) {
          overlay.style.opacity = '1';
        }
      });
    });

    setTimeout(() => {
      if (msg) {
        msg.classList.add('fade-out');
      }
      if (videoContainer) {
        videoContainer.classList.add('visible');
      }
      if (video) {
        video.style.display = 'block';
        video.style.opacity = '1';
        video.currentTime = 0;
        video.muted = false;
        video.play().catch(() => {
          video.muted = true;
          video.play().then(() => {
            if (btnWakeUp) {
              btnWakeUp.textContent = '🔊 Ativar som';
              btnWakeUp.style.display = 'block';
            }
          }).catch(err => {
            console.error('Video play failed:', err);
          });
        });

        video.onended = () => {
          this.exitEasterEgg();
        };
      }

      setTimeout(() => {
        if (msg) msg.hidden = true;
      }, prefersReducedMotion ? 0 : 800);

      let exitTimer = setTimeout(() => {
        this.showEasterEggExitButton(btnExit);
      }, 4000);

      const moveHandler = () => {
        this.showEasterEggExitButton(btnExit);
        window.removeEventListener('mousemove', moveHandler);
      };
      window.addEventListener('mousemove', moveHandler);

      const keyHandler = (e) => {
        if (e.key === 'Escape') {
          this.exitEasterEgg();
          window.removeEventListener('keydown', keyHandler);
        }
      };
      window.addEventListener('keydown', keyHandler);

      if (btnWakeUp) {
        const wakeUpHandler = () => {
          if (video) {
            video.muted = false;
            video.play().catch(() => {});
          }
          btnWakeUp.style.display = 'none';
        };
        btnWakeUp.onclick = wakeUpHandler;
        overlay.onclick = (e) => {
          if (e.target === overlay || e.target === videoContainer) {
            if (video && video.muted) {
              wakeUpHandler();
            }
          }
        };
      }

      if (btnExit) {
        btnExit.onclick = () => {
          this.exitEasterEgg();
        };
      }
    }, fadeDuration);
  }

  showEasterEggExitButton(btnExit) {
    if (!btnExit || btnExit.classList.contains('visible')) return;
    btnExit.classList.add('visible');
    btnExit.focus();
  }

  exitEasterEgg() {
    const overlay = document.getElementById('easterEggOverlay');
    const video = document.getElementById('easterEggVideo');
    const videoContainer = document.getElementById('easterEggVideoContainer');
    const btnWakeUp = document.getElementById('btnWakeUp');
    const msg = document.getElementById('easterEggMessage');

    if (video) {
      video.pause();
      video.currentTime = 0;
      video.style.display = 'none';
      video.style.opacity = '0';
    }
    if (btnWakeUp) {
      btnWakeUp.style.display = 'none';
    }
    if (videoContainer) {
      videoContainer.classList.remove('visible');
      videoContainer.hidden = true;
    }
    if (msg) {
      msg.hidden = true;
      msg.classList.remove('fade-out');
    }
    if (overlay) {
      overlay.classList.remove('active');
      overlay.hidden = true;
      overlay.setAttribute('aria-hidden', 'true');
    }
    this.restartDuel();
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
