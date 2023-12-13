import Game from './game.js';

const PLAYER_LIMIT = 4;
let inputTypes = [];

const init = () => {
    listenToInput();
    createUI();
}

const createUI = () => {
    const ui = document.querySelector("#ui");
    let joinUI = "";
    for (let i = 0; i < PLAYER_LIMIT; i++) {
        joinUI += `<div id=joinPlayer${i} class=joinPlayerUI>
            <p>Press a button to join</p>
        </div>`;
    }
    ui.innerHTML = `<div id="joinMenu">
        <div id="joinUI">
            ${joinUI}
        </div>
        <button id="start">Start</button>
    </div>`;

    const startButton = document.querySelector("#start");
    startButton.addEventListener('click', () => {
        if (inputTypes.length > 0) {
            ui.innerHTML = "";
            start();
        }
    });
}

const listenToInput = () => {
    window.addEventListener('gamepadconnected', (e) => {
        if (inputTypes.length <= PLAYER_LIMIT) {
            console.log("gamepad connected");
            inputTypes.push("gamepad");
            changeJoinUI();
        }
    });

    window.addEventListener('keydown', (e) => {
        // only one keyboard allowed
        if (inputTypes.length <= PLAYER_LIMIT && !inputTypes.includes("keyboard")) {
            console.log("keyboard connected");
            inputTypes.push("keyboard");
            changeJoinUI();
        }
    });
}

const changeJoinUI = () => {
    const idx = inputTypes.length - 1;
    const joinUI = document.querySelector(`#joinPlayer${idx}`);
    joinUI.innerHTML = `<p>Player ${idx + 1} (${inputTypes[idx]})</p>`;

}

const start = () => {
    document.body.innerHTML = `
        <canvas id="mainCanvas"></canvas>
        <div id="fps">
            <p>FPS: 0</p>
        </div>
    `;

    // move keyboard player to the end of the array
    // because we need gamepad index to match player index
    const keyboardPlayer = inputTypes.indexOf("keyboard");
    if (keyboardPlayer !== -1) {
        const keyboard = inputTypes.splice(keyboardPlayer, 1);
        inputTypes.push(keyboard[0]);
    }

    let game = new Game(inputTypes);
    game.start();
}

window.onload = init;