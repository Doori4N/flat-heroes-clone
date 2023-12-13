import Vector2 from "../../vector2.js";
import { getClosestObject, shakeScreen } from "../../utils.js";
import Collision2D from "../../collision2D.js";

let REPULSION_FORCE = 500;

export default class SeekerHead {
    position;
    velocity = new Vector2(0, 0);
    rotation = 0;
    maxSpeed;
    width;
    height;
    lifespan;
    explosionLifespan = 0.4;
    explosionRadius;
    tag = "seekerHead";
    isExploding = false;
    color;

    constructor(x, y, width, height, maxSpeed, lifespan, game, color) {
        this.position = new Vector2(x, y);
        this.width = width;
        this.height = height;
        this.explosionRadius = height / 2;
        this.maxSpeed = maxSpeed;
        this.lifespan = lifespan;
        this.ctx = game.ctx;
        this.game = game;
        this.color = color;
    }

    update(deltaTime) {
        if (this.isExploding) {
            this.updateExplosion(deltaTime);
            return;
        }

        // update the lifespan and start exploding if it is over
        this.lifespan -= deltaTime;
        if (this.lifespan <= 0) {
            this.game.soundsManager.sounds.effects.enemyExplosion.play();
            this.isExploding = true;
            shakeScreen(this.ctx, 10);
            return;
        }

        // update velocity
        const player = getClosestObject(this.game.currentScene.players, this.position);
        if (player) {
            this.seek(player);
            this.separate();
        }

        // update the position
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;

        this.checkCollision();
        this.draw();
    }

    updateExplosion(deltaTime) {
        this.drawExplosion();

        this.checkCollisionWithShockwave();

        // update the radius of the explosion
        this.explosionRadius += 30 * deltaTime;

        // update the explosion lifespan and remove the enemy if it is over
        this.explosionLifespan -= deltaTime;
        if (this.explosionLifespan <= 0) {
            // remove the enemy from the scene
            const enemyIndex = this.game.currentScene.enemies.indexOf(this);
            this.game.currentScene.enemies.splice(enemyIndex, 1);
        }
    }

    seek(target) {
        // change the rotation to point towards the target
        const angle = Math.atan2(target.position.y - this.position.y, target.position.x - this.position.x);
        this.rotation = angle * 180 / Math.PI;

        // get the desired velocity
        const desiredVelocity = new Vector2(target.position.x, target.position.y);
        desiredVelocity.sub(this.position);

        // set the magnitude of the desired velocity to the maximum speed
        desiredVelocity.setMag(this.maxSpeed);

        // get the steering force
        const steering = new Vector2(desiredVelocity.x, desiredVelocity.y);
        steering.sub(this.velocity);

        // apply the steering force
        this.velocity.add(steering);
    }

    separate() {
        this.game.currentScene.enemies.forEach(enemy => {
            if (enemy !== this && enemy.tag === "seekerHead") {
                // get the vector between the two objects, oriented towards the current object
                const vector = new Vector2(this.position.x, this.position.y);
                vector.sub(enemy.position);

                const magnitude = (1 / vector.mag()) * REPULSION_FORCE;
                vector.setMag(magnitude);

                // apply the force
                this.velocity.add(vector);
            }
        });
    }

    draw() {
        this.ctx.save();

        this.ctx.translate(this.position.x, this.position.y);
        this.ctx.rotate(this.rotation * Math.PI / 180);

        // draw a triangle
        this.ctx.beginPath();
        this.ctx.moveTo(-this.height / 2, -this.width / 2);
        this.ctx.lineTo(this.height / 2, 0);
        this.ctx.lineTo(-this.height / 2, this.width / 2);
        this.ctx.closePath();
        this.ctx.fillStyle = this.color;
        this.ctx.fill();

        this.ctx.restore();
    }

    drawExplosion() {
        this.ctx.save();

        this.ctx.translate(this.position.x, this.position.y);

        // draw an empty circle
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.explosionRadius, 0, Math.PI * 2);
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        this.ctx.closePath();

        this.ctx.restore();
    }

    checkCollision() {
        const seekerHeadVertices = Collision2D.getTriangleVertices(this.position.x, this.position.y, this.width, this.height, this.rotation);

        // check collision with walls
        this.game.currentScene.walls.forEach(wall => {
            const wallVertices = Collision2D.getRectVertices(wall.position.x, wall.position.y, wall.width, wall.height, wall.rotation);

            // get the minimum translation vector
            const mtv = Collision2D.checkOverlapPolygonSAT(seekerHeadVertices, wallVertices);
            if (mtv) {
                // get the vector between the two objects
                const vector = new Vector2(wall.position.x, wall.position.y);
                vector.sub(this.position);

                // get the dot product of the vector and the mtv
                const dot = Vector2.dot(vector, mtv);

                // if the dot product is positive, the mtv is pointing in the wrong direction
                // we need to invert it because we want the enemy to be pushed away from the wall
                if (dot > 0) {
                    mtv.mult(-1);
                }

                // apply the mtv
                this.position.add(mtv);
            }
        });
    }

    checkCollisionWithShockwave() {
        this.game.currentScene.players.forEach(player => {
            const vertices = Collision2D.getRectVertices(player.position.x, player.position.y, player.width, player.height, player.rotation);

            const mtv = Collision2D.ckeckOverlapCirclePolygonSAT(this.position, this.explosionRadius, vertices);

            // if collision, kill the player
            if (mtv) {
                player.explode();
            }
        })
    }
}