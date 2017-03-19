import TicTacToe from "./TicTacToe";

(function() {
  let cells;
  let activeCell = 0;
  const activeCellClass = "cell-active";
  const gameFieldElement = document.getElementById("gameField");
  const gameLogElement = document.getElementById("gameLog");

  function selectCell(i, j, ticTacToe, cell) {
    if (ticTacToe.game.state[i][j]) {
      alert("Cell is not empty");
      return;
    }
    const currentPlayerSign = ticTacToe.game.playerSign[ticTacToe.game.currentPlayer];
    ticTacToe.game.state[i][j] = currentPlayerSign;
    cell.classList.add(`cell-${currentPlayerSign}`);
    gameLogElement.innerText += `${currentPlayerSign}: ${cell.id}\n`;

    let result;
    if (result = ticTacToe.isGameOver(ticTacToe.game)) {
      console.log(`Game over, ${currentPlayerSign} wins`, result);
      endGame(ticTacToe, result);
    }
    ticTacToe.game.currentPlayer = (ticTacToe.game.currentPlayer + 1) % 2;
  }

  function endGame(ticTacToe, gameResult) {
    gameFieldElement.classList.add("game-over");

    if (gameResult.endType === ticTacToe.gameResultType.WIN) {
      const winLine = [].concat.apply([], gameResult.result);
      winLine.forEach((x, i) => { if (x === 1) cells[i].classList.add("cell-win"); });
      gameLogElement.innerText += `Player ${ticTacToe.game.playerSign[ticTacToe.game.currentPlayer]} wins\n`;
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

    const createOnclickHandler = (i, j, cell) => () => selectCell(i, j, ticTacToe, cell);

    ticTacToe.game.state.forEach((v, i) => {
      v.forEach((h, j) => {
        const cell = document.importNode(cellTemplate.content, true);
        cellElement = cell.firstElementChild;
        cellElement.onclick = createOnclickHandler(i, j, cellElement);
        cellElement.id = `(${j + 1},${i + 1})`;
        cells.push(cellElement);
        gameFieldElement.appendChild(cell);
      });
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