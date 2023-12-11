import Missile from "./enemies/missile.js";
import SeekerHead from "./enemies/seekerHead.js";
import Boss from "./enemies/boss.js";

export default class MissileSpawner {
    missileData;
    ctx;
    game;
    enemies;
    positionType;
    constructor(missileData, ctx, game, enemies) {
        this.missileData = missileData;
        this.ctx = ctx;
        this.game = game;
        this.enemies = enemies;
        this.positionType = (missileData.positionType === "start") ? 1 : -1;
    }
    start() {
        setTimeout(() => {
            this.spawnMissile(0);
        }, this.missileData.delay);
    }
    spawnMissile(index) {
        if (index >= this.missileData.count) {
            return;
        }
        // position offset to the top left corner of the canvas
        const offsetX = this.ctx.canvas.width / 2 - (800 / 2);
        const offsetY = this.ctx.canvas.height / 2 - (800 / 2);
        const positionX = this.missileData.position.x + (index * 16) * this.positionType * Math.cos(this.missileData.rotation * Math.PI / 180) + offsetX;
        const positionY = this.missileData.position.y - (index * 16) * this.positionType * Math.sin(this.missileData.rotation * Math.PI / 180) + offsetY;

        switch (this.missileData.type) {
            case "missile":
                this.enemies.push(new Missile(positionX, positionY, 8, 32, this.missileData.rotation, this.missileData.speed, this.ctx, this.game, this.missileData.color));
                break;
            case "seekerHead":
                this.enemies.push(new SeekerHead(positionX, positionY, 10, 20, this.missileData.speed, 5, this.ctx, this.game, this.missileData.color));
                break;
            case "boss":
                this.enemies.push(new Boss(positionX, positionY, 40, 20, this.missileData.speed, this.ctx, this.game, this.missileData.color));
                break;
            default:
                break;
        }

        if (this.missileData.interval === 0) {
            this.spawnMissile(index + 1);
        }
        else {
            setTimeout(() => {
                this.spawnMissile(index + 1);
            }, this.missileData.interval);
        }
    }
}