import { getRandInt } from "../../utils.js";
import Particle from "../particle.js";
import Vector2 from "../../vector2.js";
import Collision2D from "../../collision2D.js";

export default class Missile {
    position;
    rotation = 0;
    width;
    height;
    speed;
    ctx;
    game;
    tag = "missile";
    color;

    constructor(x, y, width, height, rotation, speed, game, color) {
        this.position = new Vector2(x, y);
        this.rotation = rotation;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.ctx = game.ctx;
        this.game = game;
        this.color = color;
    }

    update(deltaTime) {
        // apply force according to rotation
        this.position.x += this.speed * deltaTime * Math.sin(this.rotation * Math.PI / 180);
        this.position.y += this.speed * deltaTime * Math.cos(this.rotation * Math.PI / 180);

        this.checkCollision();
        this.draw();
    }

    checkCollision() {
        const missileVertices = Collision2D.getRectVertices(this.position.x, this.position.y, this.width, this.height, this.rotation);

        // check collision with walls
        this.game.currentScene.walls.forEach(wall => {
            const wallVertices = Collision2D.getRectVertices(wall.position.x, wall.position.y, wall.width, wall.height, wall.rotation);

            // get the minimum translation vector
            const mtv = Collision2D.checkOverlapPolygonSAT(missileVertices, wallVertices);
            if (mtv) {
                this.explode();
            }
        });

        // check collision with players
        this.game.currentScene.players.forEach(player => {
            const playerVertices = Collision2D.getRectVertices(player.position.x, player.position.y, player.width, player.height, player.rotation);

            const mtv = Collision2D.checkOverlapPolygonSAT(missileVertices, playerVertices);
            if (mtv) {
                this.explode();
                player.explode();
            }
        });
    }

    draw() {
        const rectWidth = this.width;
        const rectHeight = this.height - this.width;
        const circleRadius = this.width / 2;

        this.ctx.save();

        // rotate the missile
        this.ctx.translate(this.position.x, this.position.y);
        this.ctx.rotate(-this.rotation * Math.PI / 180);

        // draw the rectangle
        // translate to the top left corner of the rectangle
        this.ctx.translate(-this.width / 2, -rectHeight / 2);
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(0, 0, rectWidth, rectHeight);

        // draw the upper circle
        this.ctx.translate(circleRadius, 0);
        this.ctx.beginPath();
        this.ctx.arc(0, 0, circleRadius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.closePath();

        // draw the lower circle
        // translate to the bottom of the rectangle
        this.ctx.translate(0, rectHeight);
        this.ctx.beginPath();
        this.ctx.arc(0, 0, circleRadius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.closePath();

        this.ctx.restore();
    }

    explode() {
        // create particles
        for (let i = 0; i < 2; i++) {
            const randomVelocityX = Math.cos(getRandInt(360) * Math.PI / 180) * getRandInt(2);
            const randomVelocityY = Math.sin(getRandInt(360) * Math.PI / 180) * getRandInt(2);
            const randomRotation = getRandInt(360);
            this.game.currentScene.particles.push(new Particle(this.position.x, this.position.y, 2, 2, randomVelocityX, randomVelocityY, randomRotation, this.color, this.game, 0.3));
        }

        // remove the enemy from the scene
        const enemyIndex = this.game.currentScene.enemies.indexOf(this);
        this.game.currentScene.enemies.splice(enemyIndex, 1);
    }
}