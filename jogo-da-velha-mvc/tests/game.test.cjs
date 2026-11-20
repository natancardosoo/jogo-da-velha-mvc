const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const context = vm.createContext({ document: { addEventListener() {} } });
vm.runInContext(fs.readFileSync(require('node:path').join(__dirname, '../app.js'), 'utf8') + '\nglobalThis.Model = GameModel;', context);
const Model = context.Model;
const play = (model, moves) => moves.forEach(move => assert.equal(model.makeMove(move).success, true));

test('three losses end the duel; extra clicks cannot deduct another life', () => {
  const model = new Model();
  for (let round = 0; round < 3; round++) {
    play(model, model.startingPlayer === 'X' ? [0, 3, 1, 4, 2] : [3, 0, 4, 1, 8, 2]);
    assert.equal(model.lives.O, 2 - round);
    assert.equal(model.lives.X, 3);
    assert.equal(model.makeMove(5).success, false);
    assert.equal(model.lives.O, 2 - round);
    assert.equal(model.nextRound(), round < 2);
  }
  assert.equal(model.duelWinner, 'X');
  assert.equal(model.getBotMove(), null);
  model.resetDuel();
  assert.equal(model.lives.O, 3);
  assert.equal(model.scores.X, 0);
  assert.equal(model.round, 1);
  assert.equal(model.currentPlayer, 'X');
  assert.equal(model.duelWinner, null);
});

test('draws preserve lives and alternate the starting player', () => {
  const model = new Model();
  assert.equal(model.nextRound(), false);
  play(model, [0, 1, 2, 4, 3, 5, 7, 6, 8]);
  assert.equal(model.winner, 'draw');
  assert.equal(model.lives.X, 3);
  assert.equal(model.lives.O, 3);
  assert.equal(model.scores.draws, 1);
  assert.equal(model.nextRound(), true);
  assert.equal(model.currentPlayer, 'O');
  assert.equal(model.round, 2);
});

test('O winning deducts an X life, and invalid moves never change the turn', () => {
  const model = new Model();
  assert.equal(model.makeMove(0.5).success, false);
  assert.equal(model.currentPlayer, 'X');
  play(model, [0, 3]);
  assert.equal(model.makeMove(0).success, false);
  play(model, [1, 4, 8, 5]);
  assert.equal(model.lives.X, 2);
  assert.equal(model.lives.O, 3);
});

test('two draws trigger tiebreaker and 10x10 5-in-a-row works correctly', () => {
  const model = new Model();
  // Draw 1
  play(model, [0, 1, 2, 4, 3, 5, 7, 6, 8]);
  assert.equal(model.scores.draws, 1);
  model.nextRound();

  // Draw 2
  play(model, [0, 1, 2, 4, 3, 5, 7, 6, 8]);
  assert.equal(model.scores.draws, 2);
  assert.equal(model.pendingTiebreaker, true);

  // Start tiebreaker round
  model.nextRound();
  assert.equal(model.isTiebreakerActive, true);
  assert.equal(model.board.length, 100);

  // Play 5 in a row for X horizontally (indices 0, 1, 2, 3, 4)
  play(model, [
    0, 10,
    1, 11,
    2, 12,
    3, 13,
    4
  ]);
  assert.equal(model.winner, 'X');
  assert.equal(model.winningCombo.length, 5);
});

test('sudden death draw condition when 10x10 board is filled without winner', () => {
  const model = new Model();
  play(model, [0, 1, 2, 4, 3, 5, 7, 6, 8]);
  model.nextRound();
  play(model, [0, 1, 2, 4, 3, 5, 7, 6, 8]);
  model.nextRound();
  assert.equal(model.isTiebreakerActive, true);

  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      model.board[r * 10 + c] = ((r + Math.floor(c / 2)) % 2 === 0) ? 'X' : 'O';
    }
  }
  assert.equal(model.checkDraw(model.board), true);
});
