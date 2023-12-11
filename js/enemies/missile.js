import {checkOverlapPolygon, getRandInt, getRectVertices} from "../utils.js";
import Particle from "../Particle.js";

export default class Missile {
    position = { x: 0, y: 0 };
    rotation = 0;
    width;
    height;
    speed;
    ctx;
    game;
    tag = "missile";
    color;

    constructor(x, y, width, height, rotation, speed, ctx, game, color) {
        this.position.x = x;
        this.position.y = y;
        this.rotation = rotation;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.ctx = ctx;
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
        const missileVertices = getRectVertices(this.position.x, this.position.y, this.width, this.height, this.rotation);

        // check collision with walls
        this.game.currentScene.walls.forEach(wall => {
            const wallVertices = getRectVertices(wall.position.x, wall.position.y, wall.width, wall.height, wall.rotation);

            // get the minimum translation vector
            const mtv = checkOverlapPolygon(missileVertices, wallVertices);
            if (mtv) {
                this.explode();
            }
        });
    }
    draw() {
        const rectWidth = this.width;
        const rectHeight = this.height - (this.width * 2);
        const circleRadius = this.width / 2;

        this.ctx.save();

        // rotate the missile
        this.ctx.translate(this.position.x, this.position.y);
        this.ctx.rotate(-this.rotation * Math.PI / 180);

        // draw the rectangle
        // translate to the top left corner of the rectangle
        this.ctx.translate(-this.width / 2, -this.height / 2);
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
            this.game.currentScene.particles.push(new Particle(this.position.x, this.position.y, 2, 2, randomVelocityX, randomVelocityY, randomRotation, this.ctx, this.color, this.game, 0.3));
        }
        // remove the enemy from the scene
        const enemyIndex = this.game.currentScene.enemies.indexOf(this);
        this.game.currentScene.enemies.splice(enemyIndex, 1);
    }
}