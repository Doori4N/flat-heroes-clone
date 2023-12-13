import Vector2 from "../../vector2.js";
import { getClosestObject, getRandInt, shakeScreen} from "../../utils.js";
import Particle from "../particle.js";
import Collision2D from "../../collision2D.js";

const AIMING_TIME = 1.5;

export default class Boss {
    position;
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

    constructor(x, y, radius, lifespan, speed, game, color) {
        this.position = new Vector2(x, y);
        this.radius = radius;
        this.lifespan = lifespan;
        this.ctx = game.ctx;
        this.game = game;
        this.color = color;
        this.speed = speed;
    }

    update(deltaTime) {
        if (this.isAiming) {
            this.aimingTime -= deltaTime;
            if (this.aimingTime <= 0) {
                this.aim();
            }
        }

        // update the lifespan and start exploding if it is over
        this.lifespan -= deltaTime;
        if (this.lifespan <= 0) {
            this.explode();
            shakeScreen(this.ctx, 15);
            return;
        }

        // update position
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;

        this.checkCollision();
        this.draw();
    }

    aim() {
        const random = getRandInt(4);

        // set a random direction to prevent the boss from getting stuck behind a wall
        if (random < 1) {
            this.isAiming = false;

            const randomDirections = [{x: 1, y: 0}, {x: -1, y: 0}, {x: 0, y: 1}, {x: 0, y: -1}];
            const randomInt = getRandInt(4);
            const randomDirection = new Vector2(randomDirections[randomInt].x, randomDirections[randomInt].y);
            randomDirection.setMag(this.speed);

            this.velocity.add(randomDirection);
        }
        else {
            const player = getClosestObject(this.game.currentScene.players, this.position);
            if (player) {
                this.isAiming = false;

                const direction = new Vector2(player.position.x - this.position.x, player.position.y - this.position.y);
                direction.setMag(this.speed);

                this.velocity.add(direction);
            }
        }
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

    checkCollision() {
        this.game.currentScene.walls.forEach(wall => {
            const wallVertices = Collision2D.getRectVertices(wall.position.x, wall.position.y, wall.width, wall.height, wall.rotation);

            // get the minimum translation vector
            const mtv = Collision2D.ckeckOverlapCirclePolygonSAT(this.position, this.radius, wallVertices);
            if (mtv) {
                shakeScreen(this.ctx, 15);

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
            const playerVertices = Collision2D.getRectVertices(player.position.x, player.position.y, player.width, player.height, player.rotation);

            // get the minimum translation vector
            const mtv = Collision2D.ckeckOverlapCirclePolygonSAT(this.position, this.radius, playerVertices);
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
            this.game.currentScene.particles.push(new Particle(this.position.x, this.position.y, 6, 6, randomVelocityX, randomVelocityY, randomRotation, this.color, this.game, 1));
        }

        // remove the enemy from the scene
        const enemyIndex = this.game.currentScene.enemies.indexOf(this);
        this.game.currentScene.enemies.splice(enemyIndex, 1);
    }
}
