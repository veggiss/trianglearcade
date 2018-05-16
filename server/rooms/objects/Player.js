const SAT = require('sat');
const Bullet = require('./Bullet');
const util = require('./../utility/util');

module.exports = class Player {
    constructor(id, x, y, angle, network, name) {
        this.id = id;
        this.maxHealth = 100;
        this.level = 1;
        this.name = name;

        this.pos = util.setEnumerable({
            x: x,
            y: y,
            angle: angle,
            health: 100
        });

        this.private = util.setEnumerable({
            network: network,
            destAngle: this.pos.angle,
            alive: false,
            acceleration: 0.02,
            fireRate: 500,
            lastShot: Date.now(),
            bodyPos: {x: this.pos.x, y: this.pos.y},
            moveUp: false,
            shooting: false,
            respawnTime: 2000,
            expRate: 1.1,
            bullets: [],
            exp: 0,
            expNeeded: 200,
            score: 0,
            points: 0,
            speed: 0,
            maxSpeed: 8,
            speedBoost: 0,
            damage: 10,
            angVel: 0.1
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
            let pos = this.private.speed > 4 ? this.private.bodyPos : {x: this.pos.x, y: this.pos.y};
            let bullet = new Bullet(pos.x, pos.y, this.pos.angle, this.id, this.private.speed);
            this.private.bullets.push(bullet);

            this.private.network.sendToAllWithinProxy({bullet: {
                id: bullet.owner,
                x: bullet.x,
                y: bullet.y,
                angle: bullet.angle,
                speed: bullet.speed
            }}, {x: this.pos.x, y: this.pos.y, id: this.id}, 1000);
        }
    }

    move() {
        if (this.private.moveUp) {
            this.accelerate();
        } else {
            this.decelerate();
        }

        this.updateBody();
    }

    accelerate() {
        if (this.private.speed < (this.private.maxSpeed + this.private.speedBoost)) {
            this.private.speed += this.private.maxSpeed * this.private.acceleration;
            if (this.private.speed > this.private.maxSpeed) this.private.speed = this.private.maxSpeed;
        }
    }

    decelerate() {
        if (this.private.speed > 0) {
            this.private.speed -= this.private.maxSpeed * this.private.acceleration;
        } else {
            this.private.speed = 0;
        }
    }

    getNewAngle() {
        let shortestAngle = util.getShortestAngle(util.wrapAngle(this.pos.angle), util.wrapAngle(this.private.destAngle));
        return this.lerp(this.pos.angle, this.pos.angle + shortestAngle, this.private.angVel);
    }

    updateAngle(angle) {
        this.private.destAngle = angle;
    }

    updateBody() {
        let rad = this.pos.angle * Math.PI / 180;
        this.pos.x += Math.round(Math.sin(rad) * this.private.speed);
        this.pos.y -= Math.round(Math.cos(rad) * this.private.speed);
        this.private.bodyPos.x = this.lerp(this.private.bodyPos.x, this.pos.x, 0.175);
        this.private.bodyPos.y = this.lerp(this.private.bodyPos.y, this.pos.y, 0.175);
        this.pos.angle = Math.round(this.getNewAngle());
    }

    setMoveup(data) {
        if (this.private.alive) {
            this.private.moveUp = data;
        }
    }

    setShooting(data) {
        if (this.private.alive) {
            this.private.shooting = data;
        }
    }

    getBody() {
        return {x: this.private.bodyPos.x, y: this.private.bodyPos.y};
    }

    bulletHit(damage) {
        this.pos.health -= damage;
        let died = false;

        if (this.pos.health <= 0) { 
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
                    this.pos.health += 50;
                    this.sendUpgrade(type, this.maxHealth);
                break;
                default:
                    passed = false;
                    console.log(`Error: Could not upgrade stats on player: ${this.id}, stat type "${type}" does not exist`);
                break;
                case 'acceleration':
                    this.private.acceleration += 0.01;
                    this.sendUpgrade(type, this.private.acceleration);
                break;
                case 'angulation':
                    this.private.angVel += 0.01;
                    this.sendUpgrade(type, this.private.angVel);
                break;
            }

            if (passed) this.private.points--;
        }
    }

    sendUpgrade(type, value) {
        this.private.network.sendToClient(this.id, {statUpgrade: {
            type: type,
            value: value
        }});
    }

    die() {
        console.log('Die: ', this.pos.x, this.pos.y);
        this.private.alive = false;
        this.private.shooting = false;
        this.private.speed = 0;
        this.private.network.sendToAllWithinProxy({death: {
            id: this.id,
            x: this.pos.x,
            y: this.pos.y
        }}, {x: this.pos.x, y: this.pos.y, id: this.id}, 1000);

        this.respawn();
    }

    respawn() {
        setTimeout(() => {
            console.log('Respawn: ', this.pos.x, this.pos.y);
            let pos = util.ranWorldPos();
            let angle = util.ranPlayerAngle();
            this.pos.x = pos.x;
            this.pos.y = pos.y;
            this.pos.health = this.maxHealth;
            this.pos.angle = angle;
            this.private.speed = 0;
            this.private.bodyPos.x = pos.x;
            this.private.bodyPos.y = pos.y;
            this.private.network.sendToAllWithinProxy({respawn: {
                id: this.id,
                x: this.pos.x, 
                y: this.pos.y
            }}, {x: this.pos.x, y: this.pos.y, id: this.id}, 1000);
            this.private.alive = true;
        }, 3000);
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