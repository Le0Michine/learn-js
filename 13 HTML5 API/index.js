class TicTacToe {
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
    };
  }

  setState(newState) {
    this.game = newState;
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

class StandardRenderer {
    constructor(gameFieldRootElement) {
        this.gameFieldElement = gameFieldRootElement;
        this.activeCellClass = "cell-active";
    }

    renderField(fieldState, onSelect) {
        this.cells = [];
        this.activeCell = 0;
        this.fieldSize = fieldState.length;

        this.gameFieldElement.innerHTML = "";
        this.gameFieldElement.classList.remove("game-over");
        this.gameFieldElement.focus();
        const cellTemplate = document.getElementById("cellTemplate");

        const createOnclickHandler = (i, j) => () => {
            onSelect(i, j);
        };

        fieldState.forEach((v, i) => {
            v.forEach((h, j) => {
                const cell = document.importNode(cellTemplate.content, true);
                const cellElement = cell.firstElementChild;
                cellElement.onclick = createOnclickHandler(i, j);
                cellElement.id = `(${j + 1},${i + 1})`;
                this.cells.push(cellElement);
                this.gameFieldElement.appendChild(cell);
                if (h) {
                    this.renderSign(i, j, h);
                }
            });
        });

        this.cells[this.activeCell].classList.add(this.activeCellClass);
        this.subscribeOnEvents(fieldState);
    }

    renderSign(i, j, currentPlayerSign) {
        document.getElementById(`(${j + 1},${i + 1})`).classList.add(`cell-${currentPlayerSign}`);
        this.updateSelector({ x: j, y: i });
    }

    finishGame(winLine) {
        this.gameFieldElement.classList.add("game-over");
        this.unsubscribeFromAll();

        if (winLine) {
            winLine.forEach((x, i) => { if (x === 1) this.cells[i].classList.add("cell-win"); });
        }
    }

    onkeydown(fieldSize, event) {
        const LEFT = 37;
        const RIGHT = 39;
        const UP = 38;
        const DOWN = 40;
        const ENTER = 13;
        const SPACE = 32;

        const point = this.inflateCoordinates(this.activeCell, fieldSize);

        if (event.keyCode === ENTER || event.keyCode === SPACE) {
            this.cells[this.activeCell].click();
            return;
        } else if (event.keyCode === LEFT || event.keyCode === RIGHT) {
            point.x = (point.x + (event.keyCode === LEFT ? -1 : 1) + fieldSize) % fieldSize;
        } else {
            point.y = (point.y + (event.keyCode === UP ? -1 : 1) + fieldSize) % fieldSize;
        }

        this.updateSelector(point);
    }

    updateSelector(point) {
        this.cells[this.activeCell].classList.remove(this.activeCellClass);
        this.activeCell = this.deflateCoordinates(point, this.fieldSize);
        this.cells[this.activeCell].classList.add(this.activeCellClass);
    };

    inflateCoordinates(i, l) {
        return { x: i % l, y: Math.floor(i / l) };
    }

    deflateCoordinates(point, l) {
        return point.x + point.y * l;
    }

    subscribeOnEvents(fieldState) {
        const onKeyDownHandler = (event) => this.onkeydown(fieldState.length, event);
        this.gameFieldElement.addEventListener("keydown", onKeyDownHandler);

        this.unsubscribeFromAll = () => {
            this.gameFieldElement.removeEventListener("keydown", onKeyDownHandler);
        };
    }

    destroy() {
        this.unsubscribeFromAll();
    }
}

class CanvasRenderer {
    constructor(gameFieldRootElement) {
        this.gameFieldElement = gameFieldRootElement;
        this.canvasSize = 210;
        this.gridStep = 70;
    }

    renderField(fieldState, onSelect) {
        this.cells = [];
        this.activeCell = { x: 0, y: 0 };
        this.selectedCell = {};
        this.onSelect = onSelect;

        this.gameFieldElement.innerHTML = `<canvas id='canvasField' width='${this.canvasSize}' height = '${this.canvasSize}'>`;
        this.canvas = document.getElementById("canvasField");
        this.drawGrid(this.canvas);
        this.gameFieldElement.focus();

        this.drawSelector(this.activeCell.x, this.activeCell.y);
        this.subscribeOnEvents(fieldState);

        fieldState.forEach((v, i) => v.forEach((h, j) => { if (h) this.renderSign(i, j, h); }));
    }

    renderSign(i, j, currentPlayerSign) {
        const img = document.getElementById(`${currentPlayerSign}-img`);
        const context = this.canvas.getContext('2d');
        const width = this.gridStep - 10;
        context.drawImage(img, i * this.gridStep + 5, j * this.gridStep + 5, width, width);

        this.drawSelector(i, j);
    }

    finishGame(winLine) {
        this.gameFieldElement.classList.add("game-over");
        this.unsubscribeFromAll();

        if (winLine) {
            winLine.forEach((x, i) => {
                if (x === 1) {
                    const context = this.canvas.getContext('2d');
                    const p = this.inflateCoordinates(i, 3);
                    const rectSize = this.gridStep - 6;
                    context.fillStyle = "rgba(50, 100, 50, .5)";
                    context.fillRect(p.y * this.gridStep + 3, p.x * this.gridStep + 3, rectSize, rectSize);
                }
            });
        }
    }

    drawGrid(canvas) {
        const max = this.canvasSize;
        const step = this.gridStep;
        const context = canvas.getContext('2d');
        const drawLine = (x1, y1, x2, y2) => {
            context.beginPath();
            context.moveTo(x1, y1);
            context.lineTo(x2, y2);
            context.stroke();
        };
        drawLine(0, step, max, step);
        drawLine(0, step * 2, max, step * 2);
        drawLine(step, 0, step, max);
        drawLine(step * 2, 0, step * 2, max);
    }

    drawSelector(i, j) {
        const context = this.canvas.getContext('2d');
        const rectSize = this.gridStep - 6;

        // clear prev position
        const oldX = this.activeCell.x * this.gridStep + 1;
        const oldY = this.activeCell.y * this.gridStep + 1;
        context.clearRect(oldX, oldY, rectSize + 3, 3);
        context.clearRect(oldX, oldY, 3, rectSize + 3);
        context.clearRect(oldX + rectSize, oldY, 3, rectSize + 3);
        context.clearRect(oldX, oldY + rectSize, rectSize + 3, 3);

        // draw new selector
        context.strokeStyle = "green";
        context.strokeRect(i * this.gridStep + 3, j * this.gridStep + 3, rectSize, rectSize);
        this.activeCell = { x: i, y: j };
    }

    onclick(event) {
        const x = Math.floor((event.pageX - this.canvas.offsetLeft) / this.gridStep);
        const y = Math.floor((event.pageY - this.canvas.offsetTop) / this.gridStep);

        this.selectedCell = { x, y };
        this.onSelect(x, y);
    }

    onkeydown(fieldSize, event) {
        const LEFT = 37;
        const RIGHT = 39;
        const UP = 38;
        const DOWN = 40;
        const ENTER = 13;
        const SPACE = 32;

        const point = Object.assign({}, this.activeCell);

        if (event.keyCode === ENTER || event.keyCode === SPACE) {
            this.selectedCell = Object.assign({}, this.activeCell);
            this.onSelect(this.selectedCell.x, this.selectedCell.y);
            return;
        } else if (event.keyCode === LEFT || event.keyCode === RIGHT) {
            point.x = (point.x + (event.keyCode === LEFT ? -1 : 1) + fieldSize) % fieldSize;
        } else {
            point.y = (point.y + (event.keyCode === UP ? -1 : 1) + fieldSize) % fieldSize;
        }

        this.drawSelector(point.x, point.y);
    }

    inflateCoordinates(i, l) {
        return { x: i % l, y: Math.floor(i / l) };
    }

    subscribeOnEvents(fieldState) {
        const onKeyDownHandler = this.onkeydown.bind(this, fieldState.length);
        const onClickHandler = this.onclick.bind(this);
        this.gameFieldElement.addEventListener("keydown", onKeyDownHandler);
        this.gameFieldElement.addEventListener("click", onClickHandler);

        this.unsubscribeFromAll = () => {
            this.gameFieldElement.removeEventListener("keydown", onKeyDownHandler);
            this.gameFieldElement.removeEventListener("click", onClickHandler);
        };
    }

    destroy() {
        this.unsubscribeFromAll();
    }
}

class Logger {
    constructor() {
        this.gameLogElement = document.getElementById("gameLog");
        this.reset();
    }

    log(text) {
        this.gameLogElement.innerText += text;
    }

    reset(text) {
        this.gameLogElement.innerText = text || "Log:\n";
    }

    getFullLog() {
        return this.gameLogElement.innerText;
    }
}

let fieldRenderer;
const rendererSelector = document.getElementById("rendererType");
let gameFieldElement = document.getElementById("gameField");
const savedStateKey = "savedState";
const savedLogKey = "savedLog";
const selectedRendererKey = "selectedRenderer";
const gameLogger = new Logger();

function selectCell(i, j, ticTacToe, cell) {
  if (ticTacToe.game.state[i][j]) {
    alert("Cell is not empty");
    return;
  }
  const currentPlayerSign = ticTacToe.game.playerSign[ticTacToe.game.currentPlayer];
  ticTacToe.game.state[i][j] = currentPlayerSign;
  fieldRenderer.renderSign(i, j, currentPlayerSign);
  gameLogger.log(`${currentPlayerSign}: (${j + 1}, ${i + 1})\n`);

  let result;
  if (result = ticTacToe.isGameOver(ticTacToe.game)) {
    console.log(`Game over, ${currentPlayerSign} wins`, result);
    endGame(ticTacToe, result);
    return;
  }
  ticTacToe.game.currentPlayer = (ticTacToe.game.currentPlayer + 1) % 2;

  localStorage.setItem(savedStateKey, JSON.stringify(ticTacToe.game));
  localStorage.setItem(savedLogKey, gameLogger.getFullLog());
}

function endGame(ticTacToe, gameResult) {
  let winLine = undefined;
  if (gameResult.endType === ticTacToe.gameResultType.WIN) {
    winLine = [].concat.apply([], gameResult.result);
    gameLogger.log(`Player ${ticTacToe.game.playerSign[ticTacToe.game.currentPlayer]} wins\n`);
  } else {
    gameLogger.log("Draw\n");
  }
  fieldRenderer.finishGame(winLine);
  gameLogger.log("\npress any key\nto restart");

  gameFieldElement.addEventListener("keydown", startGame);

  clearCache();
}

function clearCache() {
  localStorage.removeItem(savedStateKey);
  localStorage.removeItem(savedLogKey);
}

function startGame() {
  const selectedRenderer = localStorage.getItem(selectedRendererKey);
  if (selectedRenderer) {
    rendererSelector.value = selectedRenderer;
  }

  gameFieldElement.removeEventListener("keydown", startGame);

  // alternative way to remove all subscriptions :)
  // const newFieldElement = gameFieldElement.cloneNode(true);
  // gameFieldElement.parentNode.replaceChild(newFieldElement, gameFieldElement);
  // gameFieldElement = newFieldElement;

  if (fieldRenderer) {
    fieldRenderer.destroy();
  }

  const savedState = JSON.parse(localStorage.getItem(savedStateKey));
  switch (rendererSelector.value) {
    case "canvas":
      console.log("canvas renderer");
      fieldRenderer = new CanvasRenderer(gameFieldElement);
      break;
    default:
      console.log("default renderer");
      fieldRenderer = new StandardRenderer(gameFieldElement);
      break;
  }
  const ticTacToe = new TicTacToe();

  if (savedState) {
    ticTacToe.setState(savedState);
  }

  gameLogger.reset(localStorage.getItem(savedLogKey));
  fieldRenderer.renderField(ticTacToe.game.state, (i, j) => selectCell(i, j, ticTacToe));
}

function initControls() {
  const newGameBtn = document.getElementById("newGame");
  newGameBtn.onclick = () => {
    clearCache();
    localStorage.setItem(selectedRendererKey, rendererSelector.value);
    startGame();
  };
}

startGame();
initControls();
