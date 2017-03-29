export default class CanvasRenderer {
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
        }
    }

    destroy() {
        this.unsubscribeFromAll();
    }
}