module.exports = class Bullet {
    constructor(x, y, angle, owner, speed) {
        this.owner = owner;
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = speed;
        this.timer = Date.now() + 900;
    }

    update() {
        this.x += Math.sin(this.angle * Math.PI / 180) * (24 + this.speed);
        this.y -= Math.cos(this.angle * Math.PI / 180) * (24 + this.speed);
    }
}