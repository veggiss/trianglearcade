const util = require('./../utility/util');

module.exports = class Seeker {
    constructor(owner, target) {
        this.owner = owner.id;
        this.target = target;
        this.x = owner.pos.x;
        this.y = owner.pos.y;
        this.angle = 0;
        this.timer = Date.now() + 3000;
    }

    update() {
        if (this.target.private.alive) {
            let dx = this.target.pos.x - this.x;
            let dy = this.target.pos.y - this.y;
            this.angle = Math.atan2(dy, dx);
        }

        this.x += Math.cos(this.angle) * 16;
        this.y += Math.sin(this.angle) * 16;
    }
}