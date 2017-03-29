import TicTacToe from "./TicTacToe";
import StandardRenderer from "./StandardRenderer";
import CanvasRenderer from "./CanvasRenderer";
import Logger from "./Logger";

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
};

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