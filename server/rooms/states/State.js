const SAT = require('sat');
const Player = require('./../objects/Player');

module.exports = class State {
    constructor() {
        this.players = {};
        this.timeline;
    }

    //Connections
    createPlayer (id, index, network) {
        let pos = this.ranWorldPos();
        this.players[id] = new Player(id, index, pos.x, pos.y, this.ranPlayerAngle(), network);
    }

    removePlayer (id) {
        delete this.players[id];
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

    //Updaters
    globalUpdate() {
        this.updatePlayers();
    }

    updatePlayers() {
        for (let id in this.players) {
            this.players[id].update();
            this.playerWorldCollision(this.players[id]);
            this.playerBulletCollision(this.players[id]);
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
                            let dx = currentPlayer.x - bullet.x; 
                            let dy = currentPlayer.y - bullet.y;
                            let dist = Math.sqrt(dx * dx + dy * dy);
                            if(dist < 25) {
                                player.bulletHit();
                            }
                        });
                    }
                }
            }
        }
    }
}