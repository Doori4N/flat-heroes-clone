export default class Player {
    inputStates = {
        left: false,
        right: false,
        up: false,
        down: false,
        space: false
    };
    x;
    y;
    speed = 5;
    ctx;

    constructor(x, y, ctx) {
        this.x = x;
        this.y = y;
        this.ctx = ctx;
        this.listenToInput();
        this.draw();
    }

    listenToInput() {
        window.addEventListener('keydown', (e) => {
            switch (e.code) {
                case 'ArrowUp':
                    this.inputStates.up = true;
                    break;
                case 'ArrowDown':
                    this.inputStates.down = true;
                    break;
                case 'ArrowLeft':
                    this.inputStates.left = true;
                    break;
                case 'ArrowRight':
                    this.inputStates.right = true;
                    break;
                case 'Space':
                    this.inputStates.space = true;
                    break;
            }
        });
        window.addEventListener('keyup', (e) => {
            switch (e.code) {
                case 'ArrowUp':
                    this.inputStates.up = false;
                    break;
                case 'ArrowDown':
                    this.inputStates.down = false;
                    break;
                case 'ArrowLeft':
                    this.inputStates.left = false;
                    break;
                case 'ArrowRight':
                    this.inputStates.right = false;
                    break;
                case 'Space':
                    this.inputStates.space = false;
                    break;
            }
        });
    }

    update() {
        this.updatePosition();
        this.draw();

    }

    updatePosition() {
        console.log("update position")
        if (this.inputStates.left) {
            this.x -= this.speed;
        }
        if (this.inputStates.right) {
            this.x += this.speed;
        }
        if (this.inputStates.down) {
            this.y += this.speed;
        }
    }

    draw() {
        this.ctx.save();
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(this.x, this.y, 30, 30);
        this.ctx.restore();
    }
}