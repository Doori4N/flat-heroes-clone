import Vector2 from "../vector2.js";

export default class Wall {
    tag = "wall";
    position;
    width;
    height;
    rotation;
    color;

    constructor(x, y, width, height, angle, color, ctx) {
        this.rotation = angle;
        this.position = new Vector2(x, y);
        this.width = width;
        this.height = height;
        this.color = color;
        this.ctx = ctx;
    }

    update(deltaTime) {
        this.draw();
    }

    draw() {
        this.ctx.save();

        this.ctx.translate(this.position.x, this.position.y);
        this.ctx.rotate(this.rotation * Math.PI / 180);
        this.ctx.translate(-this.width / 2, 0);

        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = this.height;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(this.width, 0);
        this.ctx.stroke();

        this.ctx.restore();
    }
}