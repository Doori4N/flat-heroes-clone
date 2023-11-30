export default class Wall {
    tag;
    position;
    width;
    height;
    rotation;
    constructor(x, y, width, height, angle, color) {
        this.rotation = angle;
        this.position = {
            x: x,
            y: y
        };
        this.width = width;
        this.height = height;
        this.color = color;
        this.tag = "wall";
    }

    render(ctx) {
        ctx.save();

        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.translate(-this.width / 2, 0);

        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.height;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(this.width, 0);
        ctx.stroke();

        ctx.restore();
    }
}