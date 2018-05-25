const Room = require('colyseus').Room;
const Player = require('./../objects/Player');
const Bit = require('./../objects/Bit');
const PowerUp = require('./../objects/PowerUp');
const Comet = require('./../objects/Comet');
const game = require('./../game');
const Bullet = require('./../objects/Bullet');
const Seeker = require('./../objects/Seeker');
const util = require('./../utility/util');

module.exports = class State {
    constructor(network) {
        this.players = {};
        this.bits = {};
        this.powerUps = {};
        this.comets = {};

        this.private = util.setEnumerable({
            network: network,
            leaderBoard: [],
            leaderBoardTimer: Date.now(),
            bitsTimer: Date.now(),
            powerUpTimer: Date.now(),
            bitExpAmount: 1000,
            maxBits: 75,
            maxComets: 6,
            powerUpTypes: ['healthBoost', 'xpBoost', 'speedBoost'],
            powerTypes: [['shield', 'heal'], ['seeker', 'multishot'], ['magnet', 'warpspeed'], ['trap', 'bomb']]
        });
    }

    //Connections
    createPlayer (id, client, name) {
        let pos = util.ranWorldPos();
        this.players[id] = new Player(id, pos.x, pos.y, util.ranPlayerAngle(), this.private.network, name);
        this.private.leaderBoard.push({
            id: id,
            name: name,
            score: 0
        });

        this.players[id].respawn();
    }

    removePlayer (id) {
        let index = this.private.leaderBoard.findIndex(item => {
            return item.id === id;
        });

        if (index > -1) {
            this.private.leaderBoard.splice(index, 1);
        }

        delete this.players[id];
    }

    //General gameplay
    killPlayer(player) {
        player.die();
    }

    populateBits() {
        for (let i = 0; i < this.private.maxBits; i++) {
            this.addNewBit();
        }
    }

    populateComets() {
        for (let i = 0; i < this.private.maxComets; i++) {
            this.addNewComet();
        }
    }

    addNewBit() {
        let pos = util.ranWorldPos();
        let id = util.uniqueId(4);
        while (this.bits[id]) {
            id = util.uniqueId(4);
        }

        setTimeout(() => {
            this.bits[id] = new Bit(pos.x, pos.y);
        }, util.ranNumBetween(2000, 10000));
    }

    addTrapBit(owner) {
        let id = util.uniqueId(4);
        while (this.bits[id]) {
            id = util.uniqueId(4);
        }

        this.bits[id] = new Bit(owner.pos.x, owner.pos.y);
        this.bits[id].trap = true;
        this.bits[id].owner = owner.id;
    }

    addNewPowerUp(x, y) {
        let type = this.private.powerUpTypes[Math.floor(Math.random()*this.private.powerUpTypes.length)];
        let id = util.uniqueId(4);
        while (this.powerUps[id]) {
            id = util.uniqueId(4);
        }

        this.powerUps[id] = new PowerUp(x, y, type);
    }

    addNewComet() {
        let pos = util.ranWorldPos();
        let id = util.uniqueId(4);
        while (this.comets[id]) {
            id = util.uniqueId(4);
        }

        setTimeout(() => {
            this.comets[id] = new Comet(pos.x, pos.y);
        }, util.ranNumBetween(5000, 40000));

    }

    playerGiveBit(id, player) {
        if (this.bits[id].trap) {
            if (player.id !== this.bits[id].owner) {
                if(!player.activePower('shield')) {
                    player.private.speed = 0;
                    if (player.bulletHit(player.private.damage)) {
                        let target = this.players[this.bits[id].owner];
                        if (target) {
                            target.addXp(15 * player.level);
                            target.private.score++;
                        }
                    }
                }

                this.private.network.sendToAllWithinProxy({bitHit: {
                    id: id,
                    player: player.id,
                    trap: true
                }}, {x: player.pos.x, y: player.pos.y, id: player.id}, 1000);
                delete this.bits[id];
            }
        } else {
            player.addXp(this.private.bitExpAmount);
            this.private.network.sendToAllWithinProxy({bitHit: {
                id: id,
                player: player.id
            }}, {x: player.pos.x, y: player.pos.y, id: player.id}, 1000);
            delete this.bits[id];
            this.addNewBit();
        }
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

    activateHeroPower(player, type) {
        let power = player.private.powers[type];

        if (power) {
            if (power.cooldown === false) {
                power.cooldown = true;
                power.active = true;

                switch(type) {
                    case 'shield':
                        setTimeout(() => {
                            power.active = false;
                        }, 6000);

                        setTimeout(() => {
                            power.cooldown = false;
                        }, 30000);
                    break;
                    case 'heal':
                        player.pos.health = player.maxHealth;
                        
                        setTimeout(() => {
                            power.active = false;
                        }, 1000);
                        setTimeout(() => {
                            power.cooldown = false;
                        }, 30000);
                    break;
                    case 'seeker':
                        let target = util.getNearestTarget(player, this.players);
                        if (target) {
                            let seeker = new Seeker(player, target);
                            player.private.bullets.push(seeker);
                            this.private.network.sendToAllWithinProxy({seeker: {
                                owner: player.id,
                                target: target.id
                            }}, {x: player.pos.x, y: player.pos.y, id: player.id}, 1000);
                        } else {
                            power.cooldown = false;
                            power.active = false;
                        }

                        power.active = false;
                        setTimeout(() => {
                            power.cooldown = false;
                        }, 30000);
                    break;
                    case 'multishot':
                        let offset = -7.5;
                        for (let i = 0; i < 4; i++) {
                            let pos = player.private.speed > 4 ? player.private.bodyPos : {x: player.pos.x, y: player.pos.y};
                            let bullet = new Bullet(pos.x, pos.y, player.pos.angle + offset, player.id, player.private.speed);
                            player.private.bullets.push(bullet);

                            this.private.network.sendToAllWithinProxy({bullet: {
                                id: bullet.owner,
                                x: bullet.x,
                                y: bullet.y,
                                angle: bullet.angle
                            }}, {x: player.pos.x, y: player.pos.y, id: player.id}, 1000);

                            offset += 5;
                        }
                        
                        power.active = false;
                        setTimeout(() => {
                            power.cooldown = false;
                        }, 30000);
                    break;
                    case 'magnet':
                        setTimeout(() => {
                            power.active = false;
                        }, 10000);

                        setTimeout(() => {
                            power.cooldown = false;
                        }, 30000);
                    break;
                    case 'warpspeed':
                        setTimeout(() => {
                            power.active = false;
                        }, 6000);

                        setTimeout(() => {
                            power.cooldown = false;
                        }, 30000);
                    break;
                    case 'trap':
                        this.addTrapBit(player);
                        
                        power.active = false;
                        setTimeout(() => {
                            power.cooldown = false;
                        }, 30000);
                    break;
                    case 'bomb':
                    break;
                    default:
                        console.log(`Error: Could not activate heropower on player: ${player.id}, type ${type} was not found.`);
                }
            }
        }
    }

    //Updaters
    globalUpdate() {
        this.updatePlayers();
    }

    updatePlayers() {
        for (let id in this.players) {
            let currentPlayer = this.players[id];
            if (currentPlayer.private.alive) {
                currentPlayer.update();
                this.playerWorldCollision(currentPlayer);
                this.playerBulletCollision(currentPlayer);
                this.playerBitsCollision(currentPlayer);
                this.playerPowerUpCollision(currentPlayer);
                this.cometBulletCollision(currentPlayer);
            }
        }

        this.updateLeaderBoard();
    }

    sendProximity() {
        for (let id in this.players) {
            let currentPlayer = this.players[id];

            if (currentPlayer && currentPlayer.private.alive) {
                this.private.network.sendToClient(id, {updateClient: {
                    id: id,
                    x: currentPlayer.pos.x,
                    y: currentPlayer.pos.y,
                    angle: currentPlayer.pos.angle,
                    health: currentPlayer.pos.health,
                    active: currentPlayer.getActiveList()
                }});

                let list = util.getProximityList(currentPlayer, this.players, true, 1000);
                list.forEach(targetId => {
                    this.private.network.sendToClient(targetId, {updateClient: {
                        id: id,
                        x: currentPlayer.pos.x,
                        y: currentPlayer.pos.y,
                        angle: currentPlayer.pos.angle,
                        health: currentPlayer.pos.health,
                        active: currentPlayer.getActiveList()
                    }});
                });
            }
        }
    }

    updateLeaderBoard() {
        if ((Date.now() - this.private.leaderBoardTimer) > 3000) {
            for (let id in this.players) {
                let player = this.players[id];
                let index = this.private.leaderBoard.findIndex(item => {
                    return item.id === player.id;
                });

                if (index > -1) {
                    this.private.leaderBoard[index].score = player.private.score;
                }

                this.private.leaderBoard.sort((a, b) => {
                    return a.score < b.score;
                });

                this.private.leaderBoardTimer = Date.now();
            }

            this.private.network.sendToAll({leaderboard: this.private.leaderBoard});
        }
    }

    playerWorldCollision(player) {
        if (player.pos.x < 0 || player.pos.x > 1920) this.killPlayer(player);
        else if (player.pos.y < 0 || player.pos.y > 1920) this.killPlayer(player);
    }

    playerBulletCollision(player) {
        if (player.private.alive) {
            for (let id in this.players) {
                if (id !== player.id) {
                    if (player) {
                        this.players[id].private.bullets.forEach((bullet, i, obj) => {
                            if(util.distanceFrom(bullet, player.getBody()) < 30) {
                                if(!player.activePower('shield')) {
                                    if (player.bulletHit(this.players[id].private.damage)) {
                                        let target = this.players[id];
                                        target.addXp(15 * player.level);
                                        target.private.score++;
                                    }
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
                if (player.activePower('magnet')) {
                    if (dist < 160) {
                        this.playerGiveBit(id, player);
                    }
                } else {
                    if (dist < 40) {
                        this.playerGiveBit(id, player);
                    }
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

                    this.private.network.sendToAll({powerUpHit: {
                        id: id,
                        player: player.id
                    }});

                    this.activatePowerUp(powerup.type, player);
                }
            }
        }
    }

    cometBulletCollision(player) {
        for (let id in this.comets) {
            let comet = this.comets[id];
            player.private.bullets.forEach((bullet, i, obj) => {
                let dist = util.distanceFrom(comet, bullet);
                if (dist < 25) {
                    if (comet.bulletHit(player.private.damage)) {
                        delete this.comets[id];
                        this.addNewPowerUp(comet.x, comet.y);
                        this.addNewComet();
                    }

                    obj.splice(i, 1);
                }
            });
        }
    }
}