const Room = require('colyseus').Room;
const Player = require('./../objects/Player');
const Bit = require('./../objects/Bit');
const game = require('./../game');
let network;

module.exports = class State {
    constructor() {
        this.timeline;
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
            let pos = this.ranWorldPos();
            this.bits[Object.keys(this.bits).length] = new Bit(pos.x, pos.y);
        }
    }

    distanceFrom(source, target) {
        let dx = source.x - target.x; 
        let dy = source.y - target.y;
        return Math.sqrt(dx * dx + dy * dy);
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
                    let currentPlayer = this.timeline.at(0)[player.id];
                    if (currentPlayer) {
                        this.players[id].bullets.forEach(bullet => {
                            if(this.distanceFrom(currentPlayer, bullet) < 30) {
                                player.bulletHit();
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
            let currentPlayer = this.timeline.at(0)[player.id];
            if (currentPlayer) {
                let dist = this.distanceFrom(bit, currentPlayer);
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