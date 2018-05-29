const SAT = require('sat');
const Bullet = require('./Bullet');
const util = require('./../utility/util');

module.exports = class Player {
    constructor(id, x, y, angle, network, name) {
        this.id = id;
        this.maxHealth = 100;
        this.level = 0;
        this.name = name;

        this.pos = util.setEnumerable({
            x: x,
            y: y,
            angle: angle,
            health: 100
        });

        this.private = util.setEnumerable({
            network: network,
            alive: false,
            acceleration: 0.02,
            fireRate: 500,
            lastShot: Date.now(),
            bodyPos: {x: this.pos.x, y: this.pos.y},
            moveUp: false,
            shooting: false,
            respawnTime: 2000,
            expRate: 200,
            bullets: [],
            seekers: [],
            exp: 0,
            expNeeded: 1000,
            score: 0,
            points: 0,
            speed: 0,
            maxSpeed: 8,
            speedBoost: 0,
            damage: 15,
            powers: {},
            powerList: ['', '', '', ''],
            stats: {
                firerate: 0,
                speed: 0,
                damage: 0,
                health: 0
            },
            nextPowerAt: 5,
            powerIndex: 0
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
                angle: bullet.angle
            }}, {x: this.pos.x, y: this.pos.y, id: this.id}, 1000);
        }
    }

    move() {
        if (this.private.moveUp || this.activePower('warpspeed')) {
            this.accelerate();
        } else {
            this.decelerate();
        }

        this.updateBody();
    }

    accelerate() {
        if (this.activePower('warpspeed')) {
            this.private.speed = 20;
        } else {
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

    updateAngle(angle) {
        this.pos.angle = angle;
    }

    updateBody() {
        let rad = this.pos.angle * Math.PI / 180;
        this.pos.x += Math.round(Math.sin(rad) * this.private.speed);
        this.pos.y -= Math.round(Math.cos(rad) * this.private.speed);
        this.private.bodyPos.x = this.lerp(this.private.bodyPos.x, this.pos.x, 0.175);
        this.private.bodyPos.y = this.lerp(this.private.bodyPos.y, this.pos.y, 0.175);
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
        if (this.level < 40) {
            this.private.exp += amount;
            this.checkExp();
            
            this.private.network.sendToClient(this.id, {expGain: {
                exp: this.private.exp,
                expAmount: this.private.expNeeded
            }});
        }
    }

    checkExp() {
        if (this.private.exp >= this.private.expNeeded) {
            this.level++;
            this.private.points++;
            if (this.level >= 40) {
                this.private.exp = 0;
            } else {
                this.private.exp = this.private.exp - this.private.expNeeded;
                this.private.expNeeded += this.private.expRate;
            }

            if (this.private.nextPowerAt <= 20 && this.level === this.private.nextPowerAt) {
                this.private.network.sendToClient(this.id, {levelUp: true, newPower: this.private.powerIndex});
                this.private.nextPowerAt += 5;
                this.private.powerIndex++;
            } else {
                this.private.network.sendToClient(this.id, {levelUp: true});
            }
        }
    }

    addPoint(type) {
        if (this.private.points > 0) {
            switch(type) {
                case 'firerate':
                    if (this.private.stats.firerate < 10) {
                        this.private.fireRate -= 20;
                        this.sendUpgrade(type, this.private.fireRate);
                        this.private.stats.firerate++;
                        this.private.points--;
                    }
                break;
                case 'speed':
                    if (this.private.stats.speed < 10) {
                        this.private.maxSpeed += 0.70;
                        this.sendUpgrade(type, this.private.maxSpeed);
                        this.private.stats.speed++;
                        this.private.points--;
                    }
                break;
                case 'damage':
                    if (this.private.stats.damage < 10) {
                        this.private.damage += 5;
                        this.sendUpgrade(type, this.private.damage);
                        this.private.stats.damage++;
                        this.private.points--;
                    }
                break;
                case 'health':
                    if (this.private.stats.health < 10) {
                        this.maxHealth += 20;
                        this.sendUpgrade(type, this.maxHealth);
                        this.private.stats.health++;
                        this.private.points--;
                    }
                break;
                default:
                    console.log(`Error: Could not upgrade stats on player: ${this.id}, stat type "${type}" does not exist`);
                break;
            }
        }
    }

    sendUpgrade(type, value) {
        this.private.network.sendToClient(this.id, {statUpgrade: {
            type: type,
            value: value
        }});
    }

    die() {
        this.private.alive = false;
        this.private.shooting = false;
        this.private.speed = 0;
        this.private.moveUp = false;
        this.deactivatePowers();
        
        this.private.network.sendToAllWithinProxy({death: {
            id: this.id,
            x: this.pos.x,
            y: this.pos.y
        }}, {x: this.pos.x, y: this.pos.y, id: this.id}, 1000);

        this.respawn();
    }

    respawn() {
        setTimeout(() => {
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

    deactivatePowers() {
        for (let type in this.private.powers) {
            this.private.powers[type].active = false;
        }
    }

    activePower(type) {
        let active = false;
        let powerObj = this.private.powers[type];
        if (powerObj) {
            active = powerObj.active;
        }

        return active;
    }

    getActiveList() {
        let list = [];
        for (let type in this.private.powers) {
            if (this.private.powers[type].active) {
                list.push(type);
            }
        }

        return list;
    }

    lerp(a, b, n) {
        return (1 - n) * a + n * b;
    }
}