const Room = require('colyseus').Room;
const State = require('./states/State');
const {createTimeline} = require('@gamestdio/timeline');

module.exports = class StateHandlerRoom extends Room {
    onInit (options) {
        this.setPatchRate(100);
        this.setState(new State(this));
        /*this.state.timeline = createTimeline();
        this.state.timeline.maxSnapshots = 1;
        this.state.timeline.takeSnapshot(this.state.players);*/
        this.state.populateBits();
        this.setSimulationInterval(() => this.update(), 1000 / 20);
    }

    onJoin (client) {
        this.state.createPlayer(client.sessionId, this);
        this.send(client, {id: client.sessionId});
    }

    onLeave (client) {
        this.state.removePlayer(client.sessionId);
    }

    onMessage (client, data) {
        if (typeof(data.moveUp) === 'boolean') {
            this.state.players[client.sessionId].setMoveup(data.moveUp);
        }

        if (typeof(data.shoot) === 'boolean') {
            this.state.players[client.sessionId].setShooting(data.shoot);
        }
    }

    onDispose () {
        console.log("Dispose room");
    }

    sendToAll(message) {
        this.clients.forEach(client => {
            this.send(client, message);
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