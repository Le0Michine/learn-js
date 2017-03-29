export default class Logger {
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