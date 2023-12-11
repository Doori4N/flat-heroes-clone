import Vector2 from "../vector2.js";
import {ckeckOverlapCirclePolygon, getRandInt, getRectVertices} from "../utils.js";
import Particle from "../particle.js";

const AIMING_TIME = 1.5;

export default class Boss {
    position = new Vector2(0, 0);
    velocity = new Vector2(0, 0);
    radius;
    cxt;
    game;
    tag = "boss";
    isAiming = true;
    aimingTime = AIMING_TIME;
    lifespan;
    color;
    speed;

    constructor(x, y, radius, lifespan, speed, ctx, game, color) {
        this.position.x = x;
        this.position.y = y;
        this.radius = radius;
        this.lifespan = lifespan;
        this.ctx = ctx;
        this.game = game;
        this.color = color;
        this.speed = speed;
    }

    update(deltaTime) {
        if (this.isAiming) {
            this.aimingTime -= deltaTime;
            if (this.aimingTime <= 0) {
                const player = this.getClosestPlayer();
                if (player) {
                    this.isAiming = false;

                    const direction = new Vector2(player.position.x - this.position.x, player.position.y - this.position.y);
                    direction.setMag(this.speed);

                    this.velocity.add(direction);
                }
            }
        }

        // update the lifespan and start exploding if it is over
        this.lifespan -= deltaTime;
        if (this.lifespan <= 0) {
            this.explode();
            this.shakeScreen();
            return;
        }

        // update position
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;

        this.checkCollision();
        this.draw();
    }

    draw() {
        this.ctx.save();
        this.ctx.translate(this.position.x, this.position.y);

        // draw a circle
        this.ctx.fillStyle = this.color;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.closePath();

        this.ctx.restore();
    }

    getClosestPlayer() {
        let closestPlayer;
        let closestDistance = Number.MAX_VALUE;

        this.game.currentScene.players.forEach(player => {
            const distance = Vector2.distance(this.position, player.position);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestPlayer = player;
            }
        });

        return closestPlayer;
    }

    checkCollision() {
        this.game.currentScene.walls.forEach(wall => {
            const wallVertices = getRectVertices(wall.position.x, wall.position.y, wall.width, wall.height, wall.rotation);

            // get the minimum translation vector
            const mtv = ckeckOverlapCirclePolygon(this.position, this.radius, wallVertices);
            if (mtv) {
                this.isAiming = true;
                this.aimingTime = AIMING_TIME;

                // reset velocity
                this.velocity.x = 0;
                this.velocity.y = 0;

                // get the vector between the two objects
                const vector = new Vector2(wall.position.x, wall.position.y);
                vector.sub(this.position);

                // get the dot product of the vector and the mtv
                const dot = Vector2.dot(vector, mtv);

                // if the dot product is positive, the mtv is pointing in the wrong direction
                // we need to invert it because we want the boss to be pushed away from the wall
                if (dot > 0) {
                    mtv.mult(-1);
                }

                // apply the mtv
                this.position.add(mtv);

                const reboundForce = new Vector2(mtv.x, mtv.y);
                reboundForce.setMag(10);

                // apply the force
                this.velocity.add(reboundForce);
            }
        });

        this.game.currentScene.players.forEach(player => {
            const playerVertices = getRectVertices(player.position.x, player.position.y, player.width, player.height, player.rotation);

            // get the minimum translation vector
            const mtv = ckeckOverlapCirclePolygon(this.position, this.radius, playerVertices);
            if (mtv) {
                player.explode();
            }
        });
    }

    explode() {
        // play explosion sound
        this.game.soundsManager.sounds.effects.enemyExplosion.play();

        // create particles
        for (let i = 0; i < 40; i++) {
            const randomVelocityX = Math.cos(getRandInt(360) * Math.PI / 180) * getRandInt(4);
            const randomVelocityY = Math.sin(getRandInt(360) * Math.PI / 180) * getRandInt(4);
            const randomRotation = getRandInt(360);
            this.game.currentScene.particles.push(new Particle(this.position.x, this.position.y, 6, 6, randomVelocityX, randomVelocityY, randomRotation, this.ctx, this.color, this.game, 1));
        }

        // remove the enemy from the scene
        const enemyIndex = this.game.currentScene.enemies.indexOf(this);
        this.game.currentScene.enemies.splice(enemyIndex, 1);
    }

    shakeScreen() {
        const intensity = 15;
        const offsetX = Math.random() * intensity - intensity / 2;
        const offsetY = Math.random() * intensity - intensity / 2;

        this.ctx.save();

        // apply shake
        this.ctx.translate(offsetX, offsetY);

        // restore the context after a short delay
        setTimeout(() => {
            this.ctx.restore();
        }, 50);
    }
}
