const SAT = require('sat');
const Bullet = require('./Bullet');
const V = SAT.Vector;
const C = SAT.Circle;
const P = SAT.Polygon;
let network;

module.exports = class Player {
    constructor(id, index, x, y, angle, net) {
        network = net;
        this.id = id;
        this.index = index;
        this.x = x;
        this.y = y;
        this.bodyPos = {x: this.x, y: this.y};
        this.lastDeath = Date.now();
        this.alive = true;
        this.angle = angle;
        this.moveUp = false;
        this.shooting = false;
        this.fireRate = 500;
        this.respawnTime = 2000;
        this.lastShot = Date.now() + this.fireRate;
        this.health = 100;
        this.bullets = [];
    }

    update() {
        this.move();
        this.updateBullets();
        this.updateShoot();
    }

    updateShoot() {
        if (this.shooting && (Date.now() > this.lastShot)) {
            this.lastShot = Date.now() + this.fireRate;
            let bullet = new Bullet(this.x, this.y, this.angle, this.id);
            this.bullets.push(bullet);
            network.sendToAll({bullet: {
                id: bullet.owner,
                x: bullet.x,
                y: bullet.y,
                angle: bullet.angle
            }});
        }
    }

    move() {
        if (Date.now() > this.lastDeath) {
            if (!this.alive) this.respawn();
            
            if (!this.moveUp) {
                this.angle += 5;
                if (this.angle >= 360) this.angle = 0;
            } else {
                this.angle -= 5;
                if (this.angle <= 0) this.angle = 360;
            }

            this.x += Math.sin(this.angle * Math.PI / 180) * 8;
            this.y -= Math.cos(this.angle * Math.PI / 180) * 8;
            this.bodyPos.x = this.lerp(this.bodyPos.x, this.x, 0.175);
            this.bodyPos.y = this.lerp(this.bodyPos.y, this.y, 0.175);
        }
    }

    bulletHit() {
        this.health -= 10;

        if (this.health >= 0) { 
            network.sendToAll({playerHit: {id: this.id, health: this.health}});
        } else {
            this.kill();
        }
    }

    kill() {
        this.alive = false;
        this.lastDeath = Date.now() + this.respawnTime;
        network.sendToAll({playerKilled: this.id});
    }

    respawn() {
        this.alive = true;
        this.health = 100;
        network.sendToAll({playerRespawned: this.id});
    }

    updateBullets() {
        this.bullets.forEach((bullet, index, obj) => {
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