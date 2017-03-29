export default class StandardRenderer {
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

        const point = this.inflateCoordinates(this.activeCell, fieldSize)

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
        }
    }

    destroy() {
        this.unsubscribeFromAll();
    }
}