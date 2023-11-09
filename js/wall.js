export default class Wall {
    constructor(startX, startY, endX, endY, color) {
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;
        this.color = color;
    }

    render(ctx) {
        ctx.save();

        ctx.strokeStyle = this.color;
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(this.startX, this.startY);
        ctx.lineTo(this.endX, this.endY);
        ctx.stroke();

        ctx.restore();
    }
}