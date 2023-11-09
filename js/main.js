import Game from './game.js';

const init = () => {
    let game = new Game();
    game.start();
}

window.onload = init;