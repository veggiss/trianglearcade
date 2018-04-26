const SAT = require('sat');
const Bullet = require('./Bullet');
const util = require('./../utility/util');

module.exports = class Player {
    constructor(id, x, y, angle, network) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.alive = false;
        this.angle = angle;
        this.health = 100;

        this.private = util.setEnumerable({
            network: network,
            fireRate: 500,
            lastShot: Date.now(),
            bodyPos: {x: this.x, y: this.y},
            moveUp: false,
            shooting: false,
            lastDeath: Date.now() + 5000,
            respawnTime: 2000,
            bullets: []
        });
    }

    update() {
        this.move();
        this.updateBullets();
        this.updateShoot();
    }

    updateShoot() {
        if (this.private.shooting && (Date.now() > this.private.lastShot)) {
            this.private.lastShot = Date.now() + this.private.fireRate;
            let bullet = new Bullet(this.x, this.y, this.angle, this.id);
            this.private.bullets.push(bullet);
            this.private.network.sendToAll({bullet: {
                id: bullet.owner,
                x: bullet.x,
                y: bullet.y,
                angle: bullet.angle
            }});
        }
    }

    move() {
        if (Date.now() > this.private.lastDeath) {
            if (!this.alive) this.respawn();
            
            if (!this.private.moveUp) {
                this.angle += 5;
                if (this.angle >= 360) this.angle = 0;
            } else {
                this.angle -= 5;
                if (this.angle <= 0) this.angle = 360;
            }

            this.x += Math.sin(this.angle * Math.PI / 180) * 8;
            this.y -= Math.cos(this.angle * Math.PI / 180) * 8;
            this.private.bodyPos.x = this.lerp(this.private.bodyPos.x, this.x, 0.175);
            this.private.bodyPos.y = this.lerp(this.private.bodyPos.y, this.y, 0.175);
        }
    }

    setMoveup(data) {
        this.private.moveUp = data;
    }

    setShooting(data) {
        this.private.shooting = data;
    }

    getBody() {
        return {x: this.private.bodyPos.x, y: this.private.bodyPos.y};
    }

    bulletHit() {
        this.health -= 10;

        if (this.health <= 0) { 
            this.die();
        }
    }

    die() {
        this.alive = false;
        this.private.lastDeath = Date.now() + this.private.respawnTime;
        let pos = util.ranWorldPos();
        let angle = util.ranPlayerAngle();
        this.x = pos.x;
        this.y = pos.y;
        this.angle = angle;
    }

    respawn() {
        this.alive = true;
        this.health = 100;
    }

    updateBullets() {
        this.private.bullets.forEach((bullet, index, obj) => {
            bullet.update();

            if (Date.now() > bullet.timer) {
                delete obj.splice(index, 1);
            }
        });
    }

    lerp(a, b, n) {
        return (1 - n) * a + n * b;
    }
}