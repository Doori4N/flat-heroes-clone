export default class InputManager {
    states = {
        left: false,
        up: false,
        right: false,
        down: false,
        jump: false
    };
    direction = {
        x: 0,
        y: 0
    };
    type;
    constructor(type, controllerIndex) {
        this.type = type;
        this.controllerIndex = controllerIndex;
        switch (type) {
            case "keyboard":
                this.listenKeyboard();
                break;
            case "gamepad":
                this.listenGamepad();
                break;
        }
    }
    update() {
        if (this.type === "gamepad") {
            this.listenGamepad();
        }
        
        this.direction.x = 0;
        this.direction.y = 0;

        if (this.states.left && !this.states.right) {
            this.direction.x = -1;
        }
        else if (!this.states.left && this.states.right) {
            this.direction.x = 1;
        }
        if (this.states.up && !this.states.down) {
            this.direction.y = -1;
        }
        else if (!this.states.up && this.states.down) {
            this.direction.y = 1;
        }
    }
    listenKeyboard() {
        window.addEventListener('keydown', (e) => {
            switch (e.code) {
                case 'ArrowUp':
                    this.states.up = true;
                    break;
                case 'ArrowDown':
                    this.states.down = true;
                    break;
                case 'ArrowLeft':
                    this.states.left = true;
                    break;
                case 'ArrowRight':
                    this.states.right = true;
                    break;
                case 'Space':
                    this.states.jump = true;
                    break;
            }
        });
        window.addEventListener('keyup', (e) => {
            switch (e.code) {
                case 'ArrowUp':
                    this.states.up = false;
                    break;
                case 'ArrowDown':
                    this.states.down = false;
                    break;
                case 'ArrowLeft':
                    this.states.left = false;
                    break;
                case 'ArrowRight':
                    this.states.right = false;
                    break;
                case 'Space':
                    this.states.jump = false;
                    break;
            }
        });
    }
    listenGamepad() {
        this.gamepad = navigator.getGamepads()[this.controllerIndex];
        const deadzone = 0.3;

        this.states.left = false;
        this.states.right = false;
        this.states.up = false;
        this.states.down = false;
        this.direction.x = 0;
        this.direction.y = 0;

        // get left joystick state
        if (Math.abs(this.gamepad.axes[0]) > deadzone) {
            if (this.gamepad.axes[0] < 0) {
                this.states.left = true;
            }
            else {
                this.states.right = true;
            }
            this.direction.x = this.gamepad.axes[0];
        }
        if (Math.abs(this.gamepad.axes[1]) > deadzone) {
            if (this.gamepad.axes[1] < 0) {
                this.states.up = true;
            }
            else {
                this.states.down = true;
            }
            this.direction.y = this.gamepad.axes[1];
        }

        // get jump button state
        this.states.jump = false;
        if (this.gamepad.buttons[0].pressed) {
            this.states.jump = true;
        }
    }
}