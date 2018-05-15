const util = require('./../utility/util');

module.exports = class Bullet {
    constructor(x, y, angle, owner, speed) {
        this.owner = owner;
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = speed;
        this.dest = {
            x: x + Math.sin((this.angle) / 180.0 * Math.PI) * 750,
            y: y - Math.cos((this.angle) / 180.0 * Math.PI) * 750
        }
        this.timer = Date.now() + 400;
    }

    update() {
        this.x = util.lerp(this.x, this.dest.x, 0.075);
        this.y = util.lerp(this.y, this.dest.y, 0.075);
    }
}