(function() {
  var cells;
  var activeCell = 0;
  const activeCellClass = "cell-active";
  const gameFieldElement = document.getElementById("gameField");
  const gameLogElement = document.getElementById("gameLog");

  function TicTacToe() {
    var self = this;
    var currentPlayer = 0;
    const cellsCountX = 3;
    const playerSign = ["X", "O"];

    var state = Array(Math.pow(cellsCountX, 2)).fill(0);

    this.game = {
      currentPlayer,
      playerSign,
      cellsCount: Math.pow(cellsCountX, 2),
      cellsCountX,
      state
    };

    this.isGameOver = () => {
      var game = self.game;
      const getWeight = (x) => x === game.playerSign[0] ? -1 : !x ? 0 : +1;
      var d1 = 0;
      var d2 = 0;
      for (var i = 0; i < game.cellsCountX; i++) {
        var v = 0;
        var h = 0;
        for (var j = 0; j < game.cellsCountX; j++) {
          h += getWeight(game.state[i * game.cellsCountX + j]);
          v += getWeight(game.state[i + game.cellsCountX * j]);
        }
        v = Math.abs(v);
        h = Math.abs(h);
        if (v === 3 || h === 3) {
          return {
            start: v === 3 ? i : i * game.cellsCountX,
            direction: v === 3 ? TicTacToe.winLineDirection.VERTICAL : TicTacToe.winLineDirection.HORIZONTAL,
            result: TicTacToe.gameResult.WIN
          };
        }
        d1 += getWeight(game.state[i * game.cellsCountX + i]);
        d2 += getWeight(game.state[game.cellsCountX + i * game.cellsCountX - i - 1]);
      }
      d1 = Math.abs(d1);
      d2 = Math.abs(d2);
      if (d1 === 3 || d2 === 3) {
        return {
          direction: d1 === 3 ? TicTacToe.winLineDirection.DIAGONAL : TicTacToe.winLineDirection.BACKDIAGONAL,
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

    var result;
    if (result = ticTacToe.isGameOver(ticTacToe.game)) {
      console.log(`Game over, ${ticTacToe.game.playerSign[ticTacToe.game.currentPlayer]} wins`, result);
      endGame(ticTacToe.game, result);
    }
    ticTacToe.game.currentPlayer = (ticTacToe.game.currentPlayer + 1) % 2;
  }

  function endGame(game, result) {
    gameFieldElement.classList.add("game-over");

    if (result.result === TicTacToe.gameResult.WIN) {
      var winLine = Array(game.cellsCountX);
      for (var i = 0; i < game.cellsCountX; i++) {
        winLine[i] = result.direction === TicTacToe.winLineDirection.HORIZONTAL
          ? result.start + i
          : result.direction === TicTacToe.winLineDirection.VERTICAL
            ? result.start + i * game.cellsCountX
            : result.direction === TicTacToe.winLineDirection.DIAGONAL
              ? i * game.cellsCountX + i
              : game.cellsCountX + i * game.cellsCountX - i - 1;
      }
      winLine.forEach(i => cells[i].classList.add("cell-win"));
      gameLogElement.innerText += `Player ${game.currentPlayer} wins\n`;
    } else {
      gameLogElement.innerText += "Draw\n";
    }
    gameLogElement.innerText += "\npress any key\nto restart";
    gameFieldElement.onkeydown = (event) => startGame();
  }

  function startGame() {
    var ticTacToe = new TicTacToe();
    var cellTemplate = document.getElementById("cellTemplate");
    gameFieldElement.innerHTML = "";
    gameLogElement.innerText = "Log:\n";
    gameFieldElement.classList.remove("game-over");
    gameFieldElement.focus();
    activeCell = 0;
    cells = [];

    var createOnclickHandler = (i, cell) => () => selectCell(i, ticTacToe, cell);

    ticTacToe.game.state.forEach((v, i) => {
      var cell = document.importNode(cellTemplate.content, true);
      cellElement = cell.firstElementChild;
      cellElement.onclick = createOnclickHandler(i, cellElement);
      var point = inflateCoordinates(i, ticTacToe.game.cellsCountX);
      cellElement.id = `(${point.x + 1},${point.y + 1})`;
      cells.push(cellElement);
      gameFieldElement.appendChild(cell);
    });
    cells[activeCell].classList.add(activeCellClass);
    gameFieldElement.onkeydown = (event) => onkeydown(event, ticTacToe.game.cellsCountX);
  };

  function initControls() {
    var newGameBtn = document.getElementById("newGame");
    newGameBtn.onclick = () => startGame();
  }

  function onkeydown(event, fieldSize) {
    const LEFT = 37;
    const RIGHT = 39;
    const UP = 38;
    const DOWN = 40;
    const ENTER = 13;
    const SPACE = 32;

    var point = inflateCoordinates(activeCell, fieldSize)

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