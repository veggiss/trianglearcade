const Room = require('colyseus').Room;
const State = require('./states/State');
const {createTimeline} = require('@gamestdio/timeline');

module.exports = class StateHandlerRoom extends Room {
    onInit (options) {
        this.setPatchRate(100);
        this.setState(new State(this));
        this.maxClients = 6;
        /*this.state.timeline = createTimeline();
        this.state.timeline.maxSnapshots = 1;
        this.state.timeline.takeSnapshot(this.state.players);*/
        this.state.populateBits();
        this.state.populatePowerUps();
        this.setSimulationInterval(() => this.update(), 1000 / 20);
    }

    requestJoin(options) {
        return this.clients.filter(c => c.id === options.clientId).length === 0;
    }

    onJoin (client) {
        this.state.createPlayer(client.sessionId, this, client);
        let player = this.state.players[client.sessionId];
        this.send(client, {me: {
            id: client.sessionId,
            x: player.x,
            y: player.y,
            health: player.health,
            angle: player.private.angle
        }});
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
                player.private.angle = data.updateAngle;
                this.sendToAll({playerAngle: {
                    id: client.sessionId,
                    angle: data.updateAngle}}, [client.sessionId]);
            }
        }
    }

    sendToAll(message, exclude) {
        let excludeList = Array.isArray(exclude) ? exclude : [];

        this.clients.forEach(client => {
            if (!excludeList.includes(client.sessionId)) {
                this.send(client, message);
            }
        });
    }

    sendToClient(id, message) {
        //Temporary solution
        this.clients.forEach(client => {
            if (client.sessionId === id) this.send(client, message);
        });
    }

    update() {
        this.state.globalUpdate();
        //this.saveSnapshot();
    }

    saveSnapshot() {
        let self = this;
        setTimeout(() => {
            self.state.timeline.takeSnapshot(self.state.players);
        }, 5400);
    }
}