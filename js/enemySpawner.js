import Missile from "./gameobjects/enemies/missile.js";
import SeekerHead from "./gameobjects/enemies/seekerHead.js";
import Boss from "./gameobjects/enemies/boss.js";

export default class EnemySpawner {
    enemyData;
    ctx;
    game;
    enemies;
    spawnType;
    
    constructor(enemyData, game, enemies) {
        this.enemyData = enemyData;
        this.ctx = game.ctx;
        this.game = game;
        this.enemies = enemies;
        this.setSpawnType(enemyData.spawnType);
    }

    start() {
        // spawn the first enemy after a delay
        setTimeout(() => {
            this.spawnEnemy(0);
        }, this.enemyData.delay);
    }

    spawnEnemy(index) {
        if (index >= this.enemyData.count) {
            return;
        }

        // position offset to the top left corner of the canvas
        const offsetX = this.ctx.canvas.width / 2 - (800 / 2);
        const offsetY = this.ctx.canvas.height / 2 - (800 / 2);

        // position of the enemy with the offset and rotation
        const positionX = this.enemyData.position.x + (index * 16) * this.spawnType * Math.cos(this.enemyData.rotation * Math.PI / 180) + offsetX;
        const positionY = this.enemyData.position.y - (index * 16) * this.spawnType * Math.sin(this.enemyData.rotation * Math.PI / 180) + offsetY;

        switch (this.enemyData.type) {
            case "missile":
                this.enemies.push(new Missile(positionX, positionY, 8, 26, this.enemyData.rotation, this.enemyData.speed, this.game, this.enemyData.color));
                break;
            case "seekerHead":
                this.enemies.push(new SeekerHead(positionX, positionY, 10, 20, this.enemyData.speed, 5, this.game, this.enemyData.color));
                break;
            case "boss":
                this.enemies.push(new Boss(positionX, positionY, 40, 30, this.enemyData.speed, this.game, this.enemyData.color));
                break;
            default:
                break;
        }

        if (this.enemyData.interval === 0) {
            this.spawnEnemy(index + 1);
        }
        else {
            setTimeout(() => {
                this.spawnEnemy(index + 1);
            }, this.enemyData.interval);
        }
    }

    setSpawnType(spawnType) {
        switch (spawnType) {
            // spawn in line from the start of the line
            case "lineStart":
                this.spawnType = 1;
                break;
            // spawn in line from the end of the line
            case "lineEnd":
                this.spawnType = -1;
                break;
            // spawn in a single point
            default:
                this.spawnType = 0;
                break;
        }
    }
}