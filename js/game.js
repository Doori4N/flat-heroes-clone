import Wall from "./wall.js";
import Player from "./player.js";

const SCENE_WIDTH = 800;
const SCENE_HEIGHT = 800;

export default class Game {
    scene = [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0]
    ];
    ctx;
    player;
    walls;

    constructor() {
        let canvas = document.querySelector("#mainCanvas");
        this.ctx = canvas.getContext('2d');
        this.ctx.canvas.width = window.innerWidth;
        this.ctx.canvas.height = window.innerHeight;
    }

    start() {
        console.log("game started");
        this.walls = this.convertScene(this.scene);
        this.player = new Player(window.innerWidth / 2, window.innerHeight / 2, this.ctx);
        requestAnimationFrame(this.update.bind(this));
    }

    update() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.walls.forEach(wall => {
            wall.render(this.ctx);
        });
        this.player.update();
        requestAnimationFrame(this.update.bind(this));
    }

    convertScene(scene) {
        let sceneLength = scene.length;
        let walls = [];

        // coordonnées des murs exterieurs
        const startX = window.innerWidth / 2 - SCENE_WIDTH / 2;
        const startY = window.innerHeight / 2 - SCENE_HEIGHT / 2;

        // on crée les murs exterieurs
        walls.push(new Wall(startX, startY, startX, startY + SCENE_HEIGHT, "green"));
        walls.push(new Wall(startX, startY + SCENE_HEIGHT, startX + SCENE_WIDTH, startY + SCENE_HEIGHT, "yellow"));
        walls.push(new Wall(startX + SCENE_WIDTH, startY, startX + SCENE_WIDTH, startY + SCENE_HEIGHT, "pink"));
        walls.push(new Wall(startX, startY, startX + SCENE_WIDTH, startY, "purple"));

        // on crée les murs interieurs horizontaux
        for (let i = 0; i < sceneLength; i++) {
            // correspond à la position des deux points qui définissent le mur
            let wallPos = [];
            for (let j = 0; j < sceneLength; j++) {
                if (scene[i][j] === 1) {
                    if (wallPos.length < 2)
                        wallPos.push({ x: j * 100 + startX, y: i * 100 + startY});
                    else
                        // remplace le points de fin par le nouveau
                        wallPos[1] = { x: j * 100 + startX, y: i * 100 + startY };
                }
                else {
                    // si c'est un mur horizontal on le crée
                    if (wallPos.length === 2)
                        walls.push(new Wall(wallPos[0].x, wallPos[0].y, wallPos[1].x, wallPos[1].y, "blue"));
                    // on vide le tableau pour pouvoir créer un nouveau mur
                    wallPos = [];
                }
            }
            // si c'est un mur horizontal on le crée
            if (wallPos.length === 2)
                walls.push(new Wall(wallPos[0].x, wallPos[0].y, wallPos[1].x, wallPos[1].y, "blue"));
        }
        // on crée les murs interieurs verticaux
        for (let i = 0; i < sceneLength; i++) {
            let wallPos = [];
            for (let j = 0; j < sceneLength; j++) {
                if (scene[j][i] === 1) {
                    if (wallPos.length < 2)
                        wallPos.push({ x: i * 100 + startX, y: j * 100 + startY });
                    else
                        wallPos[1] = { x: i * 100 + startX, y: j * 100 + startY };
                }
                else {
                    // si c'est un mur vertical on le crée
                    if (wallPos.length === 2)
                        walls.push(new Wall(wallPos[0].x, wallPos[0].y, wallPos[1].x, wallPos[1].y, "blue"));
                    // on vide le tableau pour pouvoir créer un nouveau mur
                    wallPos = [];
                }
            }
            // si c'est un mur vertical on le crée
            if (wallPos.length === 2)
                walls.push(new Wall(wallPos[0].x, wallPos[0].y, wallPos[1].x, wallPos[1].y, "blue"));
        }

        return walls;
    }
}