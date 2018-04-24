const SAT = require('sat');

module.exports = class Bullet {
    constructor(x, y, angle, owner) {
        this.owner = owner;
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.owner = owner;
        this.timer = Date.now() + 1000;
        this.body = new SAT.Circle(new SAT.Vector(this.x, this.y), 10);
    }

    update() {
        this.x += Math.sin(this.angle * Math.PI / 180) * 16;
        this.y -= Math.cos(this.angle * Math.PI / 180) * 16;
        this.body.pos.x = this.x;
        this.body.pos.y = this.y;
    }
}