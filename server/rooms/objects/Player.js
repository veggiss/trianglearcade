const SAT = require('sat');
const Bullet = require('./Bullet');
const V = SAT.Vector;
const C = SAT.Circle;
const P = SAT.Polygon;

let network;

module.exports = class Player {
    constructor(id, x, y, angle, net) {
        network = net;
        this.id = id;
        this.x = x;
        this.y = y;
        this.lastDeath = Date.now();
        this.alive = true;
        this.angle = angle;
        this.moveUp = false;
        this.shooting = false;
        /*this.body = new P(new V(this.x, this.y), [
            new V(1, 0), new V(0, 1), new V(1, 1)
        ]);*/
        this.lastShot = Date.now() + 200;
        this.bullets = [];
    }

    update() {
        this.move();
        this.updateBullets();
        this.updateShoot();
    }

    updateShoot() {
        if (this.shooting && (Date.now() > this.lastShot)) {
            this.lastShot = Date.now() + 200;
            let bullet = new Bullet(this.x, this.y, this.angle, this.id);
            this.bullets.push(bullet);
            network.broadcast({bullet: {
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

            //this.body.pos.x = this.lerp(this.body.pos.x, this.x, 0.1);
            //this.body.pos.y = this.lerp(this.body.pos.y, this.y, 0.1);
        }
    }

    kill() {
        this.lastDeath = Date.now() + 3000;
        this.alive = false;
        network.broadcast({playerKilled: this.id});
    }

    respawn() {
        console.log("RESPAWNED");
        this.alive = true;
        network.broadcast({playerRespawned: this.id});
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