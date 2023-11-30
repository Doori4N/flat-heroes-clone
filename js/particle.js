export default class Particle {
    constructor(x, y, width, height, velocityX, velocityY, rotation, ctx, color, game, lifetime) {
        this.position = {
            x: x,
            y: y
        }
        this.width = width;
        this.height = height;
        this.velocity = {
            x: velocityX,
            y: velocityY
        };
        this.rotation = rotation;
        this.ctx = ctx;
        this.color = color;
        this.lifetime = lifetime;
        this.game = game;
    }

    update(deltaTime) {
        this.lifetime -= deltaTime;
        if (this.lifetime <= 0) {
            // remove the particle from the scene
            const particleIndex = this.game.currentScene.particles.indexOf(this);
            this.game.currentScene.particles.splice(particleIndex, 1);
            return;
        }
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        this.draw();
    }

    draw() {
        this.ctx.save();

        this.ctx.translate(this.position.x, this.position.y);
        this.ctx.rotate(this.rotation * Math.PI / 180);

        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.ctx.restore();
    }
}