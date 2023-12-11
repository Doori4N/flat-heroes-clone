import {checkOverlapPolygon, getRandInt, getRectVertices} from "./utils.js";
import InputManager from "./inputs/InputManager.js";
import Particle from "./particle.js";
import Vector2 from "./vector2.js";

const MOVEMENT_SPEED = 4;
const ROTATION_SPEED = 7;
const JUMP_SPEED = 6;
const GRAVITY = 0.15;
const DASH_SPEED = 10;
const DASH_TIME = 0.1;

export default class Player {
    position = {
        x: 0,
        y: 0
    }
    velocity = {
        x: 0,
        y: 0
    }
    rotation = 0;
    game;
    width;
    height;
    ctx;
    tag;
    color;
    canJump = false;
    isColliding = false;
    canDash = false;
    dashCooldown = 0;
    isDashing = false;
    isJumping = false;
    isOnWall = false;
    angularVelocity = 0;

    constructor(x, y, w, h, ctx, color, game, controllerIndex, inputType) {
        this.position = {
            x: x,
            y: y
        }
        this.width = w;
        this.height = h;
        this.ctx = ctx;
        this.tag = "player";
        this.color = color;
        this.game = game;
        this.inputManager = new InputManager(inputType, controllerIndex);
    }
    update(deltaTime) {
        this.inputManager.update();

        // the player can't move if he is dashing
        if (this.dashCooldown > 0 && !this.isColliding) {
            this.dashCooldown -= deltaTime;
        }
        else {
            // when the dash is over, reset the velocity
            if (this.isDashing) {
                // TODO : create an other dash cooldown to slow down the player after the dash
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
            console.log("gravity");
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
        // if a key is pressed
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
        const playerVertices = getRectVertices(this.position.x, this.position.y, this.width, this.height, this.rotation);
        // check collision with walls
        this.game.currentScene.walls.forEach(wall => {
            const wallVertices = getRectVertices(wall.position.x, wall.position.y, wall.width, wall.height, wall.rotation);

            // get the minimum translation vector
            const mtv = checkOverlapPolygon(playerVertices, wallVertices);
            if (mtv) {
                // reset gravity
                this.velocity.y = 0;

                // if the player is colliding with a vertical wall
                if (wall.rotation === 90) {
                    console.log("vertical wall");
                    this.isOnWall = true;
                }

                this.canDash = false;
                this.canJump = true;

                // get the vector between the two objects
                const vector = { x: wall.position.x -this.position.x, y: wall.position.y - this.position.y };
                const dot = vector.x * mtv.x + vector.y * mtv.y;

                // if the mtv is pointing in the same direction as the vector, invert the mtv
                // because we want the player to be pushed away from the wall
                if (dot > 0) {
                    mtv.x = -mtv.x;
                    mtv.y = -mtv.y;
                }

                // push the player away from the wall
                this.position.x += mtv.x;
                this.position.y += mtv.y;
            }
        });

        // check collision with enemies
        this.game.currentScene.enemies.forEach(enemy => {
            const enemyVertices = getRectVertices(enemy.position.x, enemy.position.y, enemy.width, enemy.height, enemy.rotation);

            const mtv = checkOverlapPolygon(playerVertices, enemyVertices);
            if (mtv) {
                switch (enemy.tag) {
                    case "missile":
                        enemy.explode();
                        this.explode();
                        break;
                    default:
                        break;
                }
            }
        });

        // check collision with players
        this.game.currentScene.players.forEach(player => {
            if (player !== this) {
                const otherPlayerVertices = getRectVertices(player.position.x, player.position.y, player.width, player.height, player.rotation);

                const mtv = checkOverlapPolygon(playerVertices, otherPlayerVertices);
                if (mtv) {
                    // reset gravity
                    this.velocity.y = 0;

                    // get the vector between the two objects
                    const vector = new Vector2(player.position.x - this.position.x, player.position.y - this.position.y);
                    const dot = Vector2.dot(vector, mtv);

                    // if the mtv is pointing in the same direction as the vector, invert the mtv
                    // because we want the player to be pushed away from the player
                    if (dot > 0) {
                        mtv.x = -mtv.x;
                        mtv.y = -mtv.y;
                    }

                    // push the player away from the wall
                    this.position.x += mtv.x;
                    this.position.y += mtv.y;
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
            this.game.currentScene.particles.push(new Particle(this.position.x, this.position.y, 10, 10, randomVelocityX, randomVelocityY, randomRotation, this.ctx, this.color, this.game, 1));
        }
        // remove the player from the scene
        const playerIndex = this.game.currentScene.players.indexOf(this);
        this.game.currentScene.players.splice(playerIndex, 1);
    }
}