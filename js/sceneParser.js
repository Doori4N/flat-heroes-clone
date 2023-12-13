import Player from "./gameobjects/player.js";
import EnemySpawner from "./enemySpawner.js";
import Wall from "./gameobjects/wall.js";

export default class SceneParser {
    static parsePlayers(spawns, game) {
        const colors = ["purple", "yellow", "green", "pink"];
        let players = [];

        game.inputTypes.forEach((inputType, idx) => {
            const spawn = spawns[idx];
            const offsetX = window.innerWidth / 2 - game.sceneWidth / 2;
            const offsetY = window.innerHeight / 2 - game.sceneHeight / 2;
            players.push(new Player(spawn.x + offsetX, spawn.y + offsetY, 30, 30, colors[idx], game, idx, inputType));
        });

        return players;
    }

    static parseEnemies(enemyData, game) {
        let enemies = [];

        enemyData.forEach(enemy => {
            const spawner = new EnemySpawner(enemy, game, enemies);
            spawner.start();
        });

        return enemies;
    }

    static parseWalls(verticalWallArr, horizontalWallArr, game) {
        let walls = [];

        const screenCenterX = window.innerWidth / 2;
        const screenCenterY = window.innerHeight / 2;
        const startX = screenCenterX - game.sceneWidth / 2;
        const startY = screenCenterY - game.sceneHeight / 2;

        // create horizontal walls
        for (let i = 0; i < horizontalWallArr.length; i++) {
            let wall = {};
            for (let j = 0; j < horizontalWallArr[i].length; j++) {
                // create a new wall or update the width of the current wall
                if (horizontalWallArr[i][j] === 1) {
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
                    if (wall.x !== undefined) {
                        const position = { x: (wall.x + wall.width / 2) * 100 + startX, y: wall.y * 100 + startY };
                        walls.push(new Wall(position.x, position.y, wall.width * 100, 7, 0, "blue", game.ctx));
                    }
                    wall = {};
                }
            }
            if (wall.x !== undefined) {
                const position = { x: (wall.x + wall.width / 2) * 100 + startX, y: wall.y * 100 + startY };
                walls.push(new Wall(position.x, position.y, wall.width * 100, 7, 0, "blue", game.ctx));
            }
        }
        // create vertical walls
        for (let i = 0; i < verticalWallArr[0].length; i++) {
            let wall = {};
            for (let j = 0; j < verticalWallArr.length; j++) {
                // create a new wall or update the width of the current wall
                if (verticalWallArr[j][i] === 1) {
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
                    if (wall.x !== undefined) {
                        const position = { x: wall.x * 100 + startX, y: (wall.y + wall.width / 2) * 100 + startY };
                        walls.push(new Wall(position.x, position.y, wall.width * 100, 7, 90, "blue", game.ctx));
                    }
                    wall = {};
                }
            }
            if (wall.x !== undefined) {
                const position = { x: wall.x * 100 + startX, y: (wall.y + wall.width / 2) * 100 + startY };
                walls.push(new Wall(position.x, position.y, wall.width * 100, 7, 90, "blue", game.ctx));
            }
        }

        // create outer walls
        walls.push(new Wall(screenCenterX - game.sceneWidth / 2, screenCenterY + 3.5, game.sceneWidth, 7, 90,"green", game.ctx));
        walls.push(new Wall(screenCenterX - 3.5, screenCenterY - game.sceneHeight / 2, game.sceneWidth, 7, 0, "yellow", game.ctx));
        walls.push(new Wall(screenCenterX + game.sceneWidth / 2, screenCenterY - 3.5, game.sceneWidth, 7, 90, "pink", game.ctx));
        walls.push(new Wall(screenCenterX + 3.5, screenCenterY + game.sceneHeight / 2, game.sceneWidth, 7, 0, "purple", game.ctx));

        return walls;
    }
}