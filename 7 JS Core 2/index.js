(function() {
  let cells;
  let activeCell = 0;
  const activeCellClass = "cell-active";
  const gameFieldElement = document.getElementById("gameField");
  const gameLogElement = document.getElementById("gameLog");

  function TicTacToe() {
    const self = this;
    const currentPlayer = 0;
    const cellsCountX = 3;
    const playerSign = ["X", "O"];

    const state = Array(Math.pow(cellsCountX, 2)).fill(0);

    this.game = {
      currentPlayer,
      playerSign,
      cellsCount: Math.pow(cellsCountX, 2),
      cellsCountX,
      state
    };

    this.isGameOver = () => {
      const game = self.game;
      const getWeight = (x) => x === game.playerSign[0] ? -1 : !x ? 0 : +1;
      let diagonal1 = 0;
      let diagonal2 = 0;
      for (let i = 0; i < game.cellsCountX; i++) {
        let vertical = 0;
        let horizontal = 0;
        for (let j = 0; j < game.cellsCountX; j++) {
          horizontal += getWeight(game.state[i * game.cellsCountX + j]);
          vertical += getWeight(game.state[i + game.cellsCountX * j]);
        }
        vertical = Math.abs(vertical);
        horizontal = Math.abs(horizontal);
        if (vertical === 3 || horizontal === 3) {
          return {
            start: vertical === 3 ? i : i * game.cellsCountX,
            direction: vertical === 3 ? TicTacToe.winLineDirection.VERTICAL : TicTacToe.winLineDirection.HORIZONTAL,
            result: TicTacToe.gameResult.WIN
          };
        }
        diagonal1 += getWeight(game.state[i * game.cellsCountX + i]);
        diagonal2 += getWeight(game.state[game.cellsCountX + i * game.cellsCountX - i - 1]);
      }
      diagonal1 = Math.abs(diagonal1);
      diagonal2 = Math.abs(diagonal2);
      if (diagonal1 === 3 || diagonal2 === 3) {
        return {
          direction: diagonal1 === 3 ? TicTacToe.winLineDirection.DIAGONAL : TicTacToe.winLineDirection.BACKDIAGONAL,
          result: TicTacToe.gameResult.WIN
        };
      }
      return game.state.filter(x => x === 0).length ? 0 : { result: TicTacToe.gameResult.DRAW };
    }
  }

  TicTacToe.gameResult = {
    DRAW: 0,
    WIN: 1
  };

  TicTacToe.winLineDirection = {
    HORIZONTAL: 0,
    VERTICAL: 1,
    DIAGONAL: 2,
    BACKDIAGONAL: 3,
  };

  function selectCell(i, ticTacToe, cell) {
    if (ticTacToe.game.state[i]) {
      alert("Cell is not empty");
      return;
    }

    ticTacToe.game.state[i] = ticTacToe.game.playerSign[ticTacToe.game.currentPlayer];
    cell.classList.add(`cell-${ticTacToe.game.playerSign[ticTacToe.game.currentPlayer]}`);
    gameLogElement.innerText += `${ticTacToe.game.playerSign[ticTacToe.game.currentPlayer]}: ${cell.id}\n`;

    let result;
    if (result = ticTacToe.isGameOver(ticTacToe.game)) {
      console.log(`Game over, ${ticTacToe.game.playerSign[ticTacToe.game.currentPlayer]} wins`, result);
      endGame(ticTacToe.game, result);
    }
    ticTacToe.game.currentPlayer = (ticTacToe.game.currentPlayer + 1) % 2;
  }

  function endGame(game, gameResult) {
    gameFieldElement.classList.add("game-over");

    if (gameResult.result === TicTacToe.gameResult.WIN) {
      let winLine = Array(game.cellsCountX).fill(0);
      winLine = winLine.map((x, i) => gameResult.direction === TicTacToe.winLineDirection.HORIZONTAL
          ? gameResult.start + i
          : gameResult.direction === TicTacToe.winLineDirection.VERTICAL
            ? gameResult.start + i * game.cellsCountX
            : gameResult.direction === TicTacToe.winLineDirection.DIAGONAL
              ? i * game.cellsCountX + i
              : game.cellsCountX + i * game.cellsCountX - i - 1);
      winLine.forEach(i => cells[i].classList.add("cell-win"));
      gameLogElement.innerText += `Player ${game.playerSign[game.currentPlayer]} wins\n`;
    } else {
      gameLogElement.innerText += "Draw\n";
    }
    gameLogElement.innerText += "\npress any key\nto restart";
    gameFieldElement.onkeydown = (event) => startGame();
  }

  function startGame() {
    const ticTacToe = new TicTacToe();
    const cellTemplate = document.getElementById("cellTemplate");
    gameFieldElement.innerHTML = "";
    gameLogElement.innerText = "Log:\n";
    gameFieldElement.classList.remove("game-over");
    gameFieldElement.focus();
    activeCell = 0;
    cells = [];

    const createOnclickHandler = (i, cell) => () => selectCell(i, ticTacToe, cell);

    ticTacToe.game.state.forEach((v, i) => {
      const cell = document.importNode(cellTemplate.content, true);
      cellElement = cell.firstElementChild;
      cellElement.onclick = createOnclickHandler(i, cellElement);
      const point = inflateCoordinates(i, ticTacToe.game.cellsCountX);
      cellElement.id = `(${point.x + 1},${point.y + 1})`;
      cells.push(cellElement);
      gameFieldElement.appendChild(cell);
    });
    cells[activeCell].classList.add(activeCellClass);
    gameFieldElement.onkeydown = (event) => onkeydown(event, ticTacToe.game.cellsCountX);
  };

  function initControls() {
    const newGameBtn = document.getElementById("newGame");
    newGameBtn.onclick = () => startGame();
  }

  function onkeydown(event, fieldSize) {
    const LEFT = 37;
    const RIGHT = 39;
    const UP = 38;
    const DOWN = 40;
    const ENTER = 13;
    const SPACE = 32;

    const point = inflateCoordinates(activeCell, fieldSize)

    if (event.keyCode === ENTER || event.keyCode === SPACE) {
      cells[activeCell].click();
      return;
    } else if (event.keyCode === LEFT || event.keyCode === RIGHT) {
      point.x = (point.x + (event.keyCode === LEFT ? -1 : 1) + fieldSize) % fieldSize;
    } else {
      point.y = (point.y + (event.keyCode === UP ? -1 : 1) + fieldSize) % fieldSize;
    }

    cells[activeCell].classList.remove(activeCellClass);
    activeCell = deflateCoordinates(point, fieldSize);
    cells[activeCell].classList.add(activeCellClass);
  }

  function inflateCoordinates(i, l) {
    return { x: i % l, y: Math.floor(i / l) };
  }

  function deflateCoordinates(point, l) {
    return point.x + point.y * l;
  }

  startGame();
  initControls();
})();