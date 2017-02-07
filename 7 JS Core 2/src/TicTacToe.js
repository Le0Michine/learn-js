export default class TicTacToe {
  constructor () {
    Object.defineProperty(this, "gameResultType", {
      value: { DRAW: 0, WIN: 1 },
      write: false
    });
    this.game = {
      cellsCountX: 3,
      cellsCount: 9,
      currentPlayer: 0,
      playerSign: [ "X", "O" ],
      state: [
        [ 0, 0, 0 ],
        [ 0, 0, 0 ],
        [ 0, 0, 0 ]
      ]
    }
  }

  isGameOver() {
    let result = [
      [ 0, 0, 0 ],
      [ 0, 0, 0 ],
      [ 0, 0, 0 ]
    ];
    const getWeight = (x) => x === this.game.playerSign[0] ? -1 : !x ? 0 : +1;
    let diagonal1 = 0;
    let diagonal2 = 0;
    let vertical;
    let horizontal;

    for (let i = 0; i < 3; i++) {
      vertical = 0;
      horizontal = 0;
      for (let j = 0; j < 3; j++) {
        vertical += getWeight(this.game.state[j][i]);
        horizontal += getWeight(this.game.state[i][j]);
      }

      if (Math.abs(vertical) === 3) {
        result = result.map(x => { x[i] = 1; return x; });
        return {
          endType: this.gameResultType.WIN,
          result
        };
      } else if (Math.abs(horizontal) === 3) {
        result[i] = result[i].map(x => 1);
        return {
          endType: this.gameResultType.WIN,
          result
        };
      }
      diagonal1 += getWeight(this.game.state[i][i]);
      diagonal2 += getWeight(this.game.state[i][2 - i]);
    }

    if (Math.abs(diagonal1) === 3) {
      result.forEach((x, i) => x[i] = 1);
      return {
        endType: this.gameResultType.WIN,
        result
      };
    } else if (Math.abs(diagonal2) === 3) {
      result.forEach((x, i) => x[2 - i] = 1);
      return {
        endType: this.gameResultType.WIN,
        result
      };
    } else if ([].concat.apply([], this.game.state).filter(x => x === 0).length) {
      return 0;
    } else {
      return { endType: this.gameResultType.DRAW };
    }
  }
}