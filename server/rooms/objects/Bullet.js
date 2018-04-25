module.exports = class Bullet {
    constructor(x, y, angle, owner) {
        this.owner = owner;
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.owner = owner;
    }

    update() {
        this.x += Math.sin(this.angle * Math.PI / 180) * 16;
        this.y -= Math.cos(this.angle * Math.PI / 180) * 16;
    }
}