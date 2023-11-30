import { getXOverlap, getYOverlap, isRectOverlap, checkOverlapSAT, getRandInt } from "./utils.js";
import InputManager from "./inputs/InputManager.js";
import Particle from "./Particle.js";

const MOVEMENT_SPEED = 4;
const ROTATION_SPEED = 7;
const JUMP_SPEED = 6;
const GRAVITY = 0.15;
const DASH_SPEED = 10;
const DASH_TIME = 100; // in ms

export default class Player {
    inputStates = {
        left: false,
        right: false,
        up: false,
        down: false,
        space: false
    };
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
    isGrounded = false;
    isColliding = false;
    canDash = false;
    dashCooldown = 0;
    isDashing = false;
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
        this.rotation += this.angularVelocity;
        this.rotation = (this.rotation > 90 || this.rotation < -90) ? 0 : this.rotation;

        // reset isColliding so the player can jump again after the collision check
        this.isColliding = false;

        this.checkCollision();
        this.draw();
    }
    updateVelocity() {
        // // if no vertical inputs
        // this.velocity.x = 0;
        //
        // // apply movement
        // if (this.inputStates.left && !this.inputStates.right) {
        //     this.velocity.x = -MOVEMENT_SPEED;
        // }
        // else if (this.inputStates.right && !this.inputStates.left) {
        //     this.velocity.x = MOVEMENT_SPEED;
        // }
        // // the player can jump if he is not colliding with a wall
        // if (this.inputStates.up && this.isGrounded && !this.isColliding) {
        //     this.velocity.y = -JUMP_SPEED;
        //     this.isGrounded = false;
        // }
        // // apply gravity
        // if (!this.isColliding) {
        //     console.log("apply gravity");
        //     this.velocity.y += GRAVITY;
        // }
        // // the player can dash
        // if (this.inputStates.space && !this.isColliding && this.canDash) {
        //     this.dash();
        // }


        this.velocity.x = this.inputManager.direction.x * MOVEMENT_SPEED;
        this.angularVelocity = this.inputManager.direction.x * ROTATION_SPEED;

        // the player can jump if he is not colliding with a wall
        if (this.inputManager.states.space && this.isGrounded && !this.isColliding) {
            this.velocity.y = -JUMP_SPEED;
            this.isGrounded = false;
        }
        // apply gravity
        if (!this.isColliding) {
            // console.log("apply gravity");
            this.velocity.y += GRAVITY;
        }
        // if (this.inputManager.states.space && !this.isColliding && this.canDash) {
        //     this.dash();
        // }
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
        this.velocity.x = 0;
        this.velocity.y = 0;

        this.velocity.x = this.inputManager.direction.x * DASH_SPEED;
        this.velocity.y = this.inputManager.direction.y * DASH_SPEED;

        // if (this.inputStates.left && !this.inputStates.right) {
        //     this.velocity.x = -DASH_SPEED;
        // }
        // else if (this.inputStates.right && !this.inputStates.left) {
        //     this.velocity.x = DASH_SPEED;
        // }
        // if (this.inputStates.up && !this.inputStates.down) {
        //     this.velocity.y = -DASH_SPEED;
        // }
        // else if (this.inputStates.down && !this.inputStates.up) {
        //     this.velocity.y = DASH_SPEED;
        // }
        // if a key is pressed
        if (this.inputManager.states.left || this.inputManager.states.right || this.inputManager.states.up || this.inputManager.states.down) {
            this.canDash = false;
            this.isDashing = true;
            this.dashCooldown = DASH_TIME;
        }
    }
    checkCollision() {
        // check collision with walls
        this.game.currentScene.walls.forEach(wall => {
            // if (isRectOverlap(this.position.x, this.position.y, this.width, this.height, wall.position.x, wall.position.y, wall.width, wall.height)) {
            //     this.handleCollision(wall);
            // }
            const mtv = checkOverlapSAT(this.position.x, this.position.y, this.width, this.height, this.rotation, wall.position.x, wall.position.y, wall.width, wall.height, wall.rotation);
            if (mtv) {
                // reset gravity
                this.velocity.y = 0;

                this.isGrounded = true;

                // get the vector between the two objects
                const vector = { x: wall.position.x -this.position.x, y: wall.position.y - this.position.y };
                const dot = vector.x * mtv.x + vector.y * mtv.y;

                // if the mtv is pointing in the same direction as the vector, invert the mtv
                // because we want the player to be pushed away from the wall
                if (dot > 0) {
                    mtv.x = -mtv.x;
                    mtv.y = -mtv.y;
                }

                this.position.x += mtv.x;
                this.position.y += mtv.y;
            }
        });

        // check collision with enemies
        this.game.currentScene.enemies.forEach(enemy => {
            const mtv = checkOverlapSAT(this.position.x, this.position.y, this.width, this.height, this.rotation, enemy.position.x, enemy.position.y, enemy.width, enemy.height, enemy.rotation);
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
    handleCollision(object) {
        // get collision overlap
        const overlapX = getXOverlap(this.position.x, this.width, object.position.x, object.width);
        const overlapY = getYOverlap(this.position.y, this.height, object.position.y, object.height);

        switch (object.tag) {
            case "wall":
                // console.log("wall collision");
                this.isColliding = true;
                this.canDash = true;

                // remove gravity so the player can stick to the wall
                this.velocity.y = 0;

                // get the smaller overlap
                if (Math.abs(overlapX) < Math.abs(overlapY)) {
                    // set isGrounded to true so the player can jump again
                    this.isGrounded = true;
                    if (overlapX > 0) {
                        // left collision
                        this.position.x = (object.position.x + object.width) + 0.01;
                    }
                    else {
                        // right collision
                        this.position.x = object.position.x - this.width - 0.01;
                    }
                }
                else {
                    if (overlapY > 0) {
                        // top collision
                        this.position.y = (object.position.y + object.height) + 0.01;
                    }
                    else {
                        // bottom collision
                        this.position.y = object.position.y - this.height - 0.01;
                        // set isGrounded to true so the player can jump again
                        this.isGrounded = true;
                    }
                }
                break;
        }
    }
}