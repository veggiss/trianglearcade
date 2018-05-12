const Room = require('colyseus').Room;
const Player = require('./../objects/Player');
const Bit = require('./../objects/Bit');
const PowerUp = require('./../objects/PowerUp');
const Comet = require('./../objects/Comet');
const game = require('./../game');
const util = require('./../utility/util');

module.exports = class State {
    constructor(network) {
        this.players = {};
        this.bits = {};
        this.powerUps = {};
        this.comets = {};

        this.private = util.setEnumerable({
            network: network,
            bitsTimer: Date.now(),
            powerUpTimer: Date.now(),
            bitExpAmount: 25,
            powerUpTypes: ['healthBoost', 'slowDownAll', 'speedBoost', 'enrage'],
            maxBits: 75,
            maxPowerUps: 4,
            maxComets: 4
        });
    }

    //Connections
    createPlayer (id, client) {
        let pos = util.ranWorldPos();
        this.players[id] = new Player(id, pos.x, pos.y, util.ranPlayerAngle(), this.private.network, client);
    }

    removePlayer (id) {
        delete this.players[id];
    }

    //General gameplay
    killPlayer(player) {
        player.die();
        //Dies and respawns after 3 seconds with these positions
        let pos = util.ranWorldPos();
        let angle = util.ranPlayerAngle();
        player.x = pos.x;
        player.y = pos.y;
        player.private.angle = angle;
    }

    populateComets() {
        for (let i = 0; i < this.private.maxBits; i++) {
            this.addNewComet();
        }
    }

    populateBits() {
        for (let i = 0; i < this.private.maxBits; i++) {
            this.addNewBit();
        }
    }

    populatePowerUps() {
        for (let i = 0; i < this.private.maxPowerUps; i++) {
            setTimeout(() => {
                this.addNewPowerUp();
            }, util.ranNumBetween(30000, 60000));
        }
    }

    addNewBit() {
        let pos = util.ranWorldPos();
        let id = util.uniqueId(4);
        while (this.bits[id]) {
            id = util.uniqueId(4);
        }

        this.bits[id] = new Bit(pos.x, pos.y);
    }

    addNewPowerUp() {
        let pos = util.ranWorldPos();
        let type = this.private.powerUpTypes[Math.floor(Math.random()*this.private.powerUpTypes.length)];
        let id = util.uniqueId(4);
        while (this.powerUps[id]) {
            id = util.uniqueId(4);
        }

        this.powerUps[id] = new PowerUp(pos.x, pos.y, type);
    }

    addNewComet() {
        let id = util.uniqueId(4);
        while (this.comets[id]) {
            id = util.uniqueId(4);
        }
        this.comets[id] = new Comet();

    }

    activatePowerUp(type, player) {
        switch(type) {
            case 'healthBoost':
                if ((0.4 * player.maxHealth) + player.health < player.maxHealth) {
                    player.health += (0.4 * player.maxHealth);
                } else {
                    player.health = player.maxHealth;
                }
            break;
            case 'speedBoost':
                player.private.speedBoost = 5;
                setTimeout(() => {
                    player.private.speedBoost = 0;
                    if (player.private.speed > player.private.maxSpeed) player.private.speed = player.private.maxSpeed;
                }, 5000);
            break;
            default:
                console.log(`Error: Could not activate powerup on player: ${player.id}, type ${type} was not found.`);
        }
    }

    //Updaters
    globalUpdate() {
        this.updatePlayers();
    }

    updatePlayers() {
        for (let id in this.players) {
            let currentPlayer = this.players[id];
            currentPlayer.update();
            this.playerWorldCollision(currentPlayer);
            this.playerBulletCollision(currentPlayer);
            this.playerBitsCollision(currentPlayer);
            this.playerPowerUpCollision(currentPlayer);
        }
    }

    playerWorldCollision(player) {
        if (player.x < 0 || player.x > 1920) this.killPlayer(player);
        else if (player.y < 0 || player.y > 1920) this.killPlayer(player);
    }

    playerBulletCollision(player) {
        if (player.alive) {
            for (let id in this.players) {
                if (id !== player.id) {
                    if (player) {
                        this.players[id].private.bullets.forEach((bullet, i, obj) => {
                            if(util.distanceFrom(bullet, player.getBody()) < 30) {
                                if (player.bulletHit(this.players[id].private.damage)) {
                                    this.players[id].addXp(15 * player.level);
                                }
                                
                                obj.splice(i, 1);
                            }
                        });
                    }
                }
            }
        }
    }

    playerBitsCollision(player) {
        for (let id in this.bits) {
            let bit = this.bits[id];
            if (player) {
                let dist = util.distanceFrom(bit, player);
                if (dist < 40) {
                    delete this.bits[id];
                    setTimeout(() => {
                        this.addNewBit();
                    }, util.ranNumBetween(500, 3000));
                    player.addXp(this.private.bitExpAmount);
                    this.private.network.sendToAll({bitHit: {
                        id: id,
                        player: player.id
                    }});
                }
            }
        }
    }

    playerPowerUpCollision(player) {
        for (let id in this.powerUps) {
            let powerup = this.powerUps[id];
            if (player) {
                let dist = util.distanceFrom(powerup, player.private.bodyPos);
                if (dist < 25) {
                    delete this.powerUps[id];
                    setTimeout(() => {
                        this.addNewPowerUp();
                    }, util.ranNumBetween(30000, 60000));
                    this.private.network.sendToAll({powerUpHit: {
                        id: id,
                        player: player.id
                    }});

                    this.activatePowerUp(powerup.type, player);
                }
            }
        }
    }
}