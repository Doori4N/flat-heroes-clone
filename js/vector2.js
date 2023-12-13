export default class Vector2 {
    x;
    y;

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(vector) {
        this.x += vector.x;
        this.y += vector.y;
    }

    sub(vector) {
        this.x -= vector.x;
        this.y -= vector.y;
    }

    mult(scalar) {
        this.x *= scalar;
        this.y *= scalar;
    }

    div(scalar) {
        this.x /= scalar;
        this.y /= scalar;
    }

    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        const length = this.mag();
        if (length === 0) return;
        this.div(length);
    }

    setMag(length) {
        this.normalize();
        this.mult(length);
    }

    static dot(vector1, vector2) {
        return vector1.x * vector2.x + vector1.y * vector2.y;
    }

    static normal(vector) {
        const normal = new Vector2(-vector.y, vector.x);
        normal.normalize();
        return normal;
    }

    static distance(vector1, vector2) {
        const dx = vector2.x - vector1.x;
        const dy = vector2.y - vector1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}