const Room = require('colyseus').Room;
const Player = require('./../objects/Player');
const Bit = require('./../objects/Bit');
const game = require('./../game');
let network;

module.exports = class State {
    constructor() {
        //this.timeline;
        this.bitsTimer = Date.now() + 1000;
        this.players = {};
        this.bits = {};
    }

    //Connections
    createPlayer (id, index, network) {
        let pos = this.ranWorldPos();
        this.players[id] = new Player(id, index, pos.x, pos.y, this.ranPlayerAngle(), network);
    }

    removePlayer (id) {
        delete this.players[id];
    }

    setNetwork(net) {
        network = net;
    }

    //General gameplay
    playerDirection (id, dir) {
        this.players[id].dir = dir;
    }

    killPlayer(player) {
        player.kill();
        //Dies and respawns after 3 seconds with these positions
        let pos = this.ranWorldPos();
        let angle = this.ranPlayerAngle();
        player.x = pos.x;
        player.y = pos.y;
        player.angle = angle;
    }

    ranWorldPos() {
        return {x: Math.floor(Math.random() * 1520) + 300, y: Math.floor(Math.random() * 1520) + 300};
    }

    ranPlayerAngle() {
        return Math.floor(Math.random() * 360);
    }

    populateBits() {
        for (let i = 0; i < 100; i++) {
            this.addNewBit();
        }
    }

    addNewBit() {
        let pos = this.ranWorldPos();
        let id = this.uniqueId(4);
        while (this.bits[id]) {
            id = this.uniqueId(4);
        }
        this.bits[id] = new Bit(pos.x, pos.y);
    }

    bitOffset() {
        return Object.keys(this.bits).length * 10;
    }

    //Utility
    distanceFrom(source, target) {
        let dx = source.x - target.x; 
        let dy = source.y - target.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    uniqueId(length) {
        return Math.random().toString(36).substr(2, length);
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
            if (Date.now() > this.bitsTimer) {
                this.addNewBit();
                this.bitsTimer = Date.now() + this.bitOffset();
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
                        this.players[id].bullets.forEach((bullet, i, obj) => {
                            if(this.distanceFrom(bullet, player.bodyPos) < 30) {
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
                let dist = this.distanceFrom(bit, player);
                if (dist < 40) {
                    delete this.bits[id];
                    network.sendToAll({bitHit: {
                        id: id,
                        player: player.id
                    }});
                }
            }
        }
    }
}