const SAT = require('sat');
const Player = require('./../objects/Player');

module.exports = class State {
    constructor() {
        this.players = {};
        this.timeline;
        this.timer = Date.now();
    }

    //Connections
    createPlayer (id, network) {
        let pos = this.ranWorldPos();
        this.players[id] = new Player(id, pos.x, pos.y, this.ranPlayerAngle(), network);
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
            //this.playerPlayerCollition(this.players[id]);
        }
    }

    playerWorldCollision(player) {
        if (player.x < 0 || player.x > 1920) this.killPlayer(player);
        else if (player.y < 0 || player.y > 1920) this.killPlayer(player);
    }

    checkBulletHit(bullet) {
/*
        attacker: bullet.owner,
        target: id, 
        time: Date.now()
*/
        //console.log(bullet.attacker, bullet.target, bullet.time);
        /*console.log(bullet.time - Date.now());

        let dx = bullet.target.x - bullet.x; 
        let dy = player.y - bullet.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if(dist < 25) {
            this.killPlayer(player);
        }*/
    }

    /*playerPlayerCollition(player) {
        for (let id in this.players) {
            if (id !== player.id) {
                if (SAT.testCircleCircle(player.body, this.players[id].body)) {
                }
            }
        }
    }*/

    playerBulletCollision(player) {
        //if (player.alive) {
            for (let id in this.players) {
                if (id !== player.id) {
                    let currentPlayer = this.timeline.at(0)[player.id];
                    if (currentPlayer) {
                        this.players[id].bullets.forEach(bullet => {
                            let dx = currentPlayer.x - bullet.x; 
                            let dy = currentPlayer.y - bullet.y;
                            let dist = Math.sqrt(dx * dx + dy * dy);
                            if(dist < 30) {
                                this.killPlayer(player);
                            }
                        });
                    }
                }
            }
        //}
    }
}