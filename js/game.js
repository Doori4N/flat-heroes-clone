import Wall from "./wall.js";
import Player from "./player.js";
import sceneData from "./sceneData.json" assert { type: 'json' };
import MissileSpawner from "./missileSpawner.js";
import SoundsManager from "./soundsManager.js";

const SCENE_WIDTH = 800;
const SCENE_HEIGHT = 800;
let lastTime = 0;

export default class Game {
    scenes = sceneData.scenes;
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
    start() {
        this.showMenu();
    }
    createScene(data) {
        this.currentScene.walls = this.parseWalls(data.walls);
        this.currentScene.players = this.parsePlayers(data.spawns);
        this.currentScene.enemies = this.parseEnemies(data.enemies);
        this.currentScene.particles = [];
        this.currentScene.endTime = data.endTime;

        // start update loop
        this.startTime = performance.now();
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
        this.currentScene.walls.forEach(wall => {
            wall.render(this.ctx);
        });
        this.currentScene.players.forEach(player => {
            player.update(deltaTime);
        });
        this.currentScene.enemies.forEach(enemy => {
            enemy.update(deltaTime);
        });
        this.currentScene.particles.forEach(particle => {
            particle.update(deltaTime);
        });

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
    parsePlayers(spawns) {
        const colors = ["purple", "yellow", "green", "pink"];
        let players = [];

        this.inputTypes.forEach((inputType, idx) => {
            const spawn = spawns[idx];
            const offsetX = window.innerWidth / 2 - SCENE_WIDTH / 2;
            const offsetY = window.innerHeight / 2 - SCENE_HEIGHT / 2;
            players.push(new Player(spawn.x + offsetX, spawn.y + offsetY, 30, 30, this.ctx, colors[idx], this, idx, inputType));
        });

        return players;
    }
    parseWalls(wallData) {
        let sceneLength = wallData.length;
        let walls = [];

        // coordonnées des murs exterieurs
        const screenCenterX = window.innerWidth / 2;
        const screenCenterY = window.innerHeight / 2;
        const startX = window.innerWidth / 2 - SCENE_WIDTH / 2;
        const startY = window.innerHeight / 2 - SCENE_HEIGHT / 2;
        const horizontalOffset = 50;
        const verticalOffset = 50;

        // on crée les murs interieurs horizontaux
        for (let i = 0; i < sceneLength; i++) {
            let wall = {};
            for (let j = 0; j < sceneLength; j++) {
                if (wallData[i][j] === 1) {
                    if (wall.x === undefined) {
                        wall.x = j;
                        wall.y = i;
                        wall.width = 1;
                    }
                    else {
                        wall.width++;
                    }
                }
                else {
                    if (wall.x !== undefined && wall.width > 1) {
                        const position = { x: (wall.x + wall.width / 2) * 100 + startX, y: wall.y * 100 + startY };
                        walls.push(new Wall(position.x, position.y, wall.width * 100, 7, 0, "blue"));
                    }
                    wall = {};
                }
            }
            if (wall.x !== undefined && wall.width > 1) {
                const position = { x: (wall.x + wall.width / 2) * 100 + startX, y: wall.y * 100 + startY };
                walls.push(new Wall(position.x, position.y, wall.width * 100, 7, 0, "blue"));
            }
        }
        // on crée les murs interieurs verticaux
        for (let i = 0; i < sceneLength; i++) {
            let wall = {};
            for (let j = 0; j < sceneLength; j++) {
                if (wallData[j][i] === 1) {
                    if (wall.x === undefined) {
                        wall.x = i;
                        wall.y = j;
                        wall.width = 1;
                    }
                    else {
                        wall.width++;
                    }
                }
                else {
                    if (wall.x !== undefined && wall.width > 1) {
                        const position = { x: wall.x * 100 + startX, y: (wall.y + wall.width / 2) * 100 + startY };
                        walls.push(new Wall(position.x, position.y, wall.width * 100, 7, 90, "blue"));
                    }
                    wall = {};
                }
            }
            if (wall.x !== undefined && wall.width > 1) {
                const position = { x: wall.x * 100 + startX, y: (wall.y + wall.width / 2) * 100 + startY };
                walls.push(new Wall(position.x, position.y, wall.width * 100, 7, 90, "blue"));
            }
        }

        // on crée les murs exterieurs
        walls.push(new Wall(screenCenterX - SCENE_WIDTH / 2, screenCenterY + 3.5, SCENE_WIDTH, 7, 90,"green"));
        walls.push(new Wall(screenCenterX - 3.5, screenCenterY - SCENE_HEIGHT / 2, SCENE_WIDTH, 7, 0, "yellow"));
        walls.push(new Wall(screenCenterX + SCENE_WIDTH / 2, screenCenterY - 3.5, SCENE_WIDTH, 7, 90, "pink"));
        walls.push(new Wall(screenCenterX + 3.5, screenCenterY + SCENE_HEIGHT / 2, SCENE_WIDTH, 7, 0, "purple"));

        return walls;
    }
    parseEnemies(enemyData) {
        let enemies = [];

        enemyData.forEach(enemy => {
            switch (enemy.type) {
                case "missile":
                    const spawner = new MissileSpawner(enemy, this.ctx, this, enemies);
                    spawner.start();
                    break;
                default:
                    break;
            }
        });

        return enemies;
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