const SAT = require('sat');
const Bullet = require('./Bullet');
const util = require('./../utility/util');

module.exports = class Player {
    constructor(id, x, y, angle, network, client) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.alive = false;
        this.health = 100;
        this.maxHealth = 100;
        this.level = 1;

        this.private = util.setEnumerable({
            network: network,
            client: client,
            angle: angle,
            velX: 0,
            velY: 0,
            acceleration: 0.2,
            fireRate: 500,
            lastShot: Date.now(),
            bodyPos: {x: this.x, y: this.y},
            moveUp: false,
            shooting: false,
            lastDeath: Date.now(),
            respawnTime: 2000,
            expRate: 1.1,
            bullets: [],
            exp: 0,
            expNeeded: 200,
            points: 0,
            speed: 0,
            maxSpeed: 8,
            speedBoost: 0,
            damage: 10
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
            let pos = this.private.speed > 4 ? this.private.bodyPos : {x: this.x, y: this.y};
            let bullet = new Bullet(pos.x, pos.y, this.private.angle, this.id, this.private.speed);
            this.private.bullets.push(bullet);
            this.private.network.sendToAll({bullet: {
                id: bullet.owner,
                x: bullet.x,
                y: bullet.y,
                angle: bullet.angle,
                speed: bullet.speed
            }});
        }
    }

    move() {
        if (Date.now() > this.private.lastDeath) {
            if (!this.alive) this.respawn();
            
            if (this.private.moveUp) {
                this.accelerate();
                let rad = this.private.angle * Math.PI / 180;
                this.x += Math.sin(rad) * this.private.speed;
                this.y -= Math.cos(rad) * this.private.speed;
            } else {
                this.decelerate();
            }

            this.updateBody();
        }
    }

    accelerate() {
        if (this.private.speed < (this.private.maxSpeed + this.private.speedBoost)) {
            this.private.speed += 1;
        }
    }

    decelerate() {
        if (this.private.speed > 0) {
            this.private.speed -= 0.5;
        } else {
            this.private.speed = 0;
        }
    }

    updateBody() {
        this.private.bodyPos.x = this.lerp(this.private.bodyPos.x, this.x, 0.175);
        this.private.bodyPos.y = this.lerp(this.private.bodyPos.y, this.y, 0.175);
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

    bulletHit(damage) {
        this.health -= damage;
        let died = false;

        if (this.health <= 0) { 
            this.die();
            died = true;
        }

        return died;
    }

    addXp(amount) {
        this.private.exp += amount;
        this.checkExp();
        
        this.private.network.sendToClient(this.id, {expGain: {
            exp: this.private.exp,
            expAmount: this.private.expNeeded
        }});
    }

    checkExp() {
        if (this.private.exp >= this.private.expNeeded) {
            this.level++;
            this.private.points++;
            this.private.exp = this.private.exp - this.private.expNeeded;
            this.private.expNeeded *= this.private.expRate;

            this.private.network.sendToClient(this.id, {levelUp: true});
        }
    }

    addPoint(type) {
        if (this.private.points > 0) {
            let passed = true;
            switch(type) {
                case 'firerate':
                    this.private.fireRate -= 25;
                    this.sendUpgrade(type, this.private.fireRate);
                break;
                case 'speed':
                    this.private.maxSpeed += 0.75;
                    this.sendUpgrade(type, this.private.maxSpeed);
                break;
                case 'damage':
                    this.private.damage += 5;
                    this.sendUpgrade(type, this.private.damage);
                break;
                case 'health':
                    this.maxHealth += 50;
                    this.health += 50;
                    this.sendUpgrade(type, this.maxHealth);
                break;
                default:
                    passed = false;
                    console.log(`Case "${type}" does not exist`);
                break;
            }

            this.private.points--;
        }
    }

    sendUpgrade(type, value) {
        this.private.network.sendToClient(this.id, {statUpgrade: {
            type: type,
            value: value
        }});
    }

    die() {
        this.alive = false;
        this.private.lastDeath = Date.now() + this.private.respawnTime;
        let pos = util.ranWorldPos();
        let angle = util.ranPlayerAngle();
        this.x = pos.x;
        this.y = pos.y;
        this.private.angle = angle;
    }

    respawn() {
        this.alive = true;
        this.health = this.maxHealth;
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