import SoundsManager from "./soundsManager.js";
import SceneParser from "./sceneParser.js";

const SCENE_WIDTH = 800;
const SCENE_HEIGHT = 800;
let lastTime = 0;

export default class Game {
    sceneWidth = SCENE_WIDTH;
    sceneHeight = SCENE_HEIGHT;
    scenes = [];
    sceneIndex = 0;
    currentScene = {};
    ctx;
    inputTypes;
    frameCount = 0;
    lastMeasure = 0;
    startTime = 0;
    soundsManager = new SoundsManager();

    constructor(inputTypes) {
        let canvas = document.querySelector("#mainCanvas");
        this.ctx = canvas.getContext('2d');
        this.ctx.canvas.width = window.innerWidth;
        this.ctx.canvas.height = window.innerHeight;
        this.inputTypes = inputTypes;
    }

    async start() {
        const sceneData = await fetch('/flat-heroes-js/assets/json/scenes.json').then(response => response.json());
        this.scenes = sceneData.scenes;

        this.soundsManager.sounds.musics.background.play();
        this.showMenu();
    }

    createScene(data) {
        this.currentScene.walls = SceneParser.parseWalls(data.verticalWalls, data.horizontalWalls, this);
        this.currentScene.players = SceneParser.parsePlayers(data.spawns, this);
        this.currentScene.enemies = SceneParser.parseEnemies(data.enemies, this);
        this.currentScene.particles = [];
        this.currentScene.endTime = data.endTime;

        this.startTime = performance.now();

        // start update loop
        requestAnimationFrame(this.update.bind(this));
    }

    update(time) {
        // get delta time
        if (lastTime === 0) {
            lastTime = time;
        }
        const deltaTime = (time - lastTime) / 1000;
        lastTime = time;
        this.measureFPS(time);

        // time elapsed since the start of the scene
        const timeElapsed = performance.now() - this.startTime;

        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        // update game objects
        for (let i = this.currentScene.players.length - 1; i >= 0; i--) {
            this.currentScene.players[i].update(deltaTime);
        }
        for (let i = this.currentScene.enemies.length - 1; i >= 0; i--) {
            this.currentScene.enemies[i].update(deltaTime);
        }
        for (let i = this.currentScene.walls.length - 1; i >= 0; i--) {
            this.currentScene.walls[i].update(deltaTime);
        }
        for (let i = this.currentScene.particles.length - 1; i >= 0; i--) {
            this.currentScene.particles[i].update(deltaTime);
        }

        // if there is no player left
        if (this.currentScene.players.length <= 0 && this.currentScene.particles.length <= 0) {
            this.showLossMenu();
            return;
        }
        // if there are no more enemies
        else if (timeElapsed > this.currentScene.endTime && this.currentScene.enemies.length <= 0) {
            this.showWinMenu();
            return;
        }

        this.frameCount++;
        requestAnimationFrame(this.update.bind(this));
    }

    measureFPS(time) {
        const diffTime = time - this.lastMeasure;
        if (diffTime >= 1000) {
            this.lastMeasure = time;
            const fps = this.frameCount;
            this.frameCount = 0;

            // update html element
            const fpsElement = document.querySelector("#fps");
            fpsElement.innerHTML = `FPS: ${Math.round(fps)}`;
        }
    }

    changeScene(idx) {
        if (idx < this.scenes.length) {
            this.sceneIndex = idx;
            this.createScene(this.scenes[this.sceneIndex]);
        }
        else {
            this.showMenu();
        }
    }

    showLossMenu() {
        const body = document.querySelector("body");
        const menu = document.createElement("div");
        menu.innerHTML = `
            <div class="menu">
                <h1>Game Over</h1>
                <button id="restart">Restart</button>
                <button id="menu">Menu</button>
            </div>
        `;
        body.appendChild(menu);

        const restartBtn = document.querySelector("#restart");
        restartBtn.addEventListener("click", () => {
            this.soundsManager.sounds.effects.button.play();
            this.changeScene(this.sceneIndex);
            menu.remove();
        });

        const menuBtn = document.querySelector("#menu");
        menuBtn.addEventListener("click", () => {
            this.soundsManager.sounds.effects.button.play();
            this.showMenu();
            menu.remove();
        });
    }

    showWinMenu() {
        const body = document.querySelector("body");
        const menu = document.createElement("div");
        menu.innerHTML = `
            <div class="menu">
                <h1>Victory</h1>
                <button id="next">Next level</button>
                <button id="menu">Menu</button>
            </div>
        `;
        body.appendChild(menu);

        const nextBtn = document.querySelector("#next");
        nextBtn.addEventListener("click", () => {
            this.soundsManager.sounds.effects.button.play();
            this.changeScene(this.sceneIndex + 1);
            menu.remove();
        });

        const menuBtn = document.querySelector("#menu");
        menuBtn.addEventListener("click", () => {
            this.soundsManager.sounds.effects.button.play();
            this.showMenu();
            menu.remove();
        });
    }

    showMenu() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        const body = document.querySelector("body");
        const menu = document.createElement("div");

        // create levels dropdown
        let levels = '';
        this.scenes.forEach((scene, idx) => {
            levels += `<option value="${idx + 1}">Level ${idx + 1}</option>`;
        });

        menu.innerHTML = `
            <div class="menu">
                <h1>Flat Heroes</h1>
                <select id="level">
                    ${levels}
                </select>
                <button id="play">Play</button>
                <button id="options">Options</button>
            </div>
        `;
        body.appendChild(menu);

        const playBtn = document.querySelector("#play");
        playBtn.addEventListener("click", () => {
            this.soundsManager.sounds.effects.button.play();
            const level = document.querySelector("#level").value;
            this.changeScene(level - 1);
            menu.remove();
        });

        const optionsBtn = document.querySelector("#options");
        optionsBtn.addEventListener("click", () => {
            this.soundsManager.sounds.effects.button.play();
            this.showOptions();
            menu.remove();
        });
    }

    showOptions() {
        const body = document.querySelector("body");
        const menu = document.createElement("div");
        menu.innerHTML = `
            <div class="menu">
                <h1>Options</h1>
                <div>
                    <label for="musicVolume">Music Volume:</label>
                    <input type="range" id="musicVolume" min="0" max="1" step="0.1" value="${this.soundsManager.musicVolume}">
                </div>
                <div>
                    <label for="effectsVolume">Effects Sound Volume:</label>
                    <input type="range" id="effectsVolume" min="0" max="1" step="0.1" value="${this.soundsManager.effectVolume}">
                </div>
                <button id="back">Back</button>
            </div>
        `;
        body.appendChild(menu);

        const backBtn = document.querySelector("#back");
        backBtn.addEventListener("click", () => {
            this.soundsManager.sounds.effects.button.play();
            this.showMenu();
            menu.remove();
        });

        const musicVolume = document.querySelector("#musicVolume");
        musicVolume.addEventListener("input", () => {
            this.soundsManager.changeMusicVolume(musicVolume.value);
        });

        const effectsVolume = document.querySelector("#effectsVolume");
        effectsVolume.addEventListener("input", () => {
            this.soundsManager.changeEffectVolume(effectsVolume.value);
        });
    }
}