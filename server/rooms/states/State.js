const Room = require('colyseus').Room;
const Player = require('./../objects/Player');
const Bit = require('./../objects/Bit');
const game = require('./../game');
const util = require('./../utility/util');

let bitsTimer = Date.now() + 1000;

module.exports = class State {
    constructor(network) {
        this.players = {};
        this.bits = {};

        this.private = util.setEnumerable({
            network: network,
            bitsTimer: Date.now() + 1000,
            bitExpAmount: 25
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

    populateBits() {
        for (let i = 0; i < 100; i++) {
            this.addNewBit();
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

    bitOffset() {
        return Object.keys(this.bits).length * 10;
    }

    //Updaters
    globalUpdate() {
        this.updatePlayers();
        this.updateBits();
    }

    updatePlayers() {
        for (let id in this.players) {
            let currentPlayer = this.players[id];
            currentPlayer.update();
            this.playerWorldCollision(currentPlayer);
            this.playerBulletCollision(currentPlayer);
            this.playerBitsCollision(currentPlayer);
        }
    }

    updateBits() {
        if (Object.keys(this.bits).length < 100) {
            if (Date.now() > bitsTimer) {
                this.addNewBit();
                bitsTimer = Date.now() + this.bitOffset();
            }
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
                                player.bulletHit();
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
                    player.addXp(this.private.bitExpAmount);
                    this.private.network.sendToAll({bitHit: {
                        id: id,
                        player: player.id
                    }});
                }
            }
        }
    }
}