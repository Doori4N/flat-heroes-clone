import { getRandInt } from "../utils.js";
import InputManager from "../InputManager.js";
import Particle from "./particle.js";
import Vector2 from "../vector2.js";
import Collision2D from "../collision2D.js";

const MOVEMENT_SPEED = 4;
const ROTATION_SPEED = 7;
const JUMP_SPEED = 6;
const GRAVITY = 0.15;
const DASH_SPEED = 10;
const DASH_TIME = 0.1;

export default class Player {
    position;
    velocity = new Vector2(0, 0);
    rotation = 0;
    game;
    width;
    height;
    ctx;
    tag = "player";
    color;
    canJump = false;
    canDash = false;
    dashCooldown = 0;
    isDashing = false;
    isJumping = false;
    isOnWall = false;
    angularVelocity = 0;

    constructor(x, y, w, h, color, game, controllerIndex, inputType) {
        this.position = new Vector2(x, y);
        this.width = w;
        this.height = h;
        this.ctx = game.ctx;
        this.color = color;
        this.game = game;
        this.inputManager = new InputManager(inputType, controllerIndex);
    }

    update(deltaTime) {
        this.inputManager.update();

        // the player can't move if he is dashing
        if (this.dashCooldown > 0) {
            this.dashCooldown -= deltaTime;
        }
        else {
            // when the dash is over, reset the velocity
            if (this.isDashing) {
                this.isDashing = false;
                if (this.velocity.y < 0) {
                    this.velocity.y = -2;
                }
                else {
                    this.velocity.y = 0;
                }
            }
            this.updateVelocity();
        }

        // update position
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        // update rotation
        if (!this.isOnWall) {
            this.rotation += this.angularVelocity;
            this.rotation = (this.rotation > 90 || this.rotation < -90) ? 0 : this.rotation;
        }

        // reset
        this.isOnWall = false;
        if (this.isJumping && !this.inputManager.states.jump) {
            this.canDash = true;
            this.isJumping = false;
        }

        this.checkCollision();
        this.draw();
    }

    updateVelocity() {
        this.velocity.x = this.inputManager.direction.x * MOVEMENT_SPEED;
        this.angularVelocity = this.inputManager.direction.x * ROTATION_SPEED;

        // console.log(this.inputManager.states.jump);

        // the player can jump if he is not colliding with a wall
        if (this.inputManager.states.jump && this.canJump && !this.isOnWall) {
            this.velocity.y = -JUMP_SPEED;
            this.canJump = false;
            this.isJumping = true;
        }

        // the player can dash if he is not colliding with a wall
        if (this.inputManager.states.jump && this.canDash && !this.isJumping) {
            this.dash();
        }

        // apply gravity
        if (!this.isOnWall) {
            this.velocity.y += GRAVITY;
        }
    }

    draw() {
        this.ctx.save();

        // translate to the center of the player
        this.ctx.translate(this.position.x, this.position.y);

        this.ctx.rotate(this.rotation * Math.PI / 180);

        // translate to the top left corner of the player
        this.ctx.translate(-this.width / 2, -this.height / 2);

        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.ctx.restore();
    }

    dash() {
        // if there is a direction input
        if (this.inputManager.states.left || this.inputManager.states.right || this.inputManager.states.up || this.inputManager.states.down) {
            this.velocity.x = 0;
            this.velocity.y = 0;

            this.velocity.x = this.inputManager.direction.x * DASH_SPEED;
            this.velocity.y = this.inputManager.direction.y * DASH_SPEED;

            this.canDash = false;
            this.isDashing = true;
            this.dashCooldown = DASH_TIME;
        }
    }

    checkCollision() {
        const playerVertices = Collision2D.getRectVertices(this.position.x, this.position.y, this.width, this.height, this.rotation);

        // check collision with walls
        this.game.currentScene.walls.forEach(wall => {
            const wallVertices = Collision2D.getRectVertices(wall.position.x, wall.position.y, wall.width, wall.height, wall.rotation);

            // get the minimum translation vector
            const mtv = Collision2D.checkOverlapPolygonSAT(playerVertices, wallVertices);
            if (mtv) {
                // reset gravity
                this.velocity.y = 0;

                // if the player is colliding with a vertical wall
                if (wall.rotation === 90) {
                    this.isOnWall = true;
                }

                this.canDash = false;
                this.canJump = true;

                // get the vector between the two objects
                const vector = new Vector2(wall.position.x - this.position.x, wall.position.y - this.position.y);
                const dot = Vector2.dot(vector, mtv);

                // if the mtv is pointing in the same direction as the vector, invert the mtv
                // because we want the player to be pushed away from the wall
                if (dot > 0) {
                    mtv.mult(-1);
                }

                // push the player away from the wall
                this.position.add(mtv);
            }
        });

        // check collision with players
        this.game.currentScene.players.forEach(player => {
            if (player !== this) {
                const otherPlayerVertices = Collision2D.getRectVertices(player.position.x, player.position.y, player.width, player.height, player.rotation);

                const mtv = Collision2D.checkOverlapPolygonSAT(playerVertices, otherPlayerVertices);
                if (mtv) {
                    // reset gravity
                    this.velocity.y = 0;

                    // get the vector between the two objects
                    const vector = new Vector2(player.position.x - this.position.x, player.position.y - this.position.y);
                    const dot = Vector2.dot(vector, mtv);

                    // if the mtv is pointing in the same direction as the vector, invert the mtv
                    // because we want the player to be pushed away from the other player
                    if (dot > 0) {
                        mtv.mult(-1);
                    }

                    // push the player away from the player
                    this.position.add(mtv);
                }
            }
        });
    }

    explode() {
        // play explosion sound
        this.game.soundsManager.sounds.effects.explosion.play();

        // create particles
        for (let i = 0; i < 10; i++) {
            const randomVelocityX = Math.cos(getRandInt(360) * Math.PI / 180) * getRandInt(5);
            const randomVelocityY = Math.sin(getRandInt(360) * Math.PI / 180) * getRandInt(5);
            const randomRotation = getRandInt(360);
            this.game.currentScene.particles.push(new Particle(this.position.x, this.position.y, 10, 10, randomVelocityX, randomVelocityY, randomRotation, this.color, this.game, 1));
        }

        // remove the player from the scene
        const playerIndex = this.game.currentScene.players.indexOf(this);
        this.game.currentScene.players.splice(playerIndex, 1);
    }
}