const Room = require('colyseus').Room;
const State = require('./states/State');
const {createTimeline} = require('@gamestdio/timeline');
const util = require('./utility/util');

module.exports = class StateHandlerRoom extends Room {
    onInit (options) {
        this.setPatchRate(500);
        this.setState(new State(this));
        this.maxClients = 10;
        this.state.populateBits();
        this.state.populateComets();
        this.state.newDeathWall();
        this.setSimulationInterval(() => this.update(), 1000 / 20);
        setInterval(() => this.updateProximity(), 100);
    }

    requestJoin(options) {
        return this.clients.filter(c => c.id === options.clientId).length === 0;
    }

    onJoin (client, opt) {
        this.state.createPlayer(client.sessionId, this, opt.name);
        let player = this.state.players[client.sessionId];
        this.send(client, {me: {id: client.sessionId}});
    }

    onLeave (client) {
        this.state.removePlayer(client.sessionId);
    }

    onMessage (client, data) {
        let player = this.state.players[client.sessionId];

        if (player) {
            if (typeof(data.moveUp) === 'boolean') {
                player.setMoveup(data.moveUp);
            }

            if (typeof(data.shoot) === 'boolean') {
                player.setShooting(data.shoot);
            }

            if (typeof(data.pointsAdded) === 'string') {
                player.addPoint(data.pointsAdded);
            }

            if (typeof(data.updateAngle) === 'number') {
                if (data.updateAngle >= 0 && data.updateAngle <= 360) player.updateAngle(data.updateAngle);
            }

            if (typeof(data.activatePower) === 'number') {
                if (player.private.alive) {
                    let type = player.private.powerList[data.activatePower];
                    if (type) {
                        this.state.activateHeroPower(player, type);
                    }
                }
            }

            if (typeof(data.powerChosen) === 'object') {
                let option = data.powerChosen.option;
                let index = data.powerChosen.index;
                if (option === 0 || option === 1) {
                    let powerLength = Object.keys(player.private.powers).length;
                    if (index <= 3 && index >= 0 && powerLength < 4) {
                        let type = this.state.private.powerTypes[index][option];
                        player.private.powerList[index] = type;
                        player.private.powers[type] = {
                            cooldown: false,
                            active: false
                        }
                    }
                }
            }
        }
    }

    updateProximity() {
        this.state.sendProximity();
    }

    sendToAll(message, exclude) {
        let excludeList = Array.isArray(exclude) ? exclude : [];

        this.clients.forEach(client => {
            if (!excludeList.includes(client.sessionId)) {
                if (client.readyState === 1) {
                    this.send(client, message);
                }
            }
        });
    }

    sendToAllWithinProxy(message, player, range) {
        let excludeList = util.getProximityList(player, this.state.players, false, range);
        this.sendToAll(message, excludeList);
    }

    sendToClient(id, message) {
        this.clients.forEach(client => {
            if (client.sessionId === id) {
                if (client.readyState === 1) {
                    this.send(client, message);
                }
            }
        });
    }

    update() {
        this.state.globalUpdate();
    }

    saveSnapshot() {
        let self = this;
        setTimeout(() => {
            self.state.timeline.takeSnapshot(self.state.players);
        }, 5400);
    }
}