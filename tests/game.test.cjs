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

test('all difficulties make legal moves without changing the board', () => {
  const model = new Model();
  model.makeMove(0);
  for (const difficulty of ['easy', 'medium', 'hard']) {
    model.botDifficulty = difficulty;
    const before = JSON.stringify(model.board);
    assert.equal(model.board[model.getBotMove()], null);
    assert.equal(JSON.stringify(model.board), before);
  }
  model.board = ['O', 'O', null, 'X', 'X', null, null, null, 'X'];
  model.botDifficulty = 'hard';
  assert.equal(model.getBotMove(), 2);
});
