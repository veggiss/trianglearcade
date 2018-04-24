const Room = require('colyseus').Room;
const State = require('./states/State');
const {createTimeline} = require('@gamestdio/timeline');

module.exports = class StateHandlerRoom extends Room {
    onInit (options) {
        //console.log("New room created!", options);
        this.setSimulationInterval(() => this.update(), 1000 / 20);
        this.setPatchRate(100);
        this.setState(new State());
        this.state.timeline = createTimeline();
        this.state.timeline.maxSnapshots = 1;
        this.saveSnapshot();
    }

    onJoin (client) {
        this.state.createPlayer(client.sessionId, this);
        this.send(client, {id: client.sessionId});
    }

    onLeave (client) {
        this.state.removePlayer(client.sessionId);
    }

    onMessage (client, data) {
        if (data.moveUp === true) {
            this.state.players[client.sessionId].moveUp = true;
        } else if (data.moveUp === false){
            this.state.players[client.sessionId].moveUp = false;
        }

        if (data.shoot === true) {
            this.state.players[client.sessionId].shooting = true;
        } else if (data.shoot === false) {
            this.state.players[client.sessionId].shooting = false;
        }

        if (data.bulletHit) {
            this.state.checkBulletHit(data.bulletHit);
        }
    }

    onDispose () {
        console.log("Dispose room");
    }

    update() {
        this.state.globalUpdate();
    }

    saveSnapshot() {
        let self = this;
        setInterval(() => {
            self.state.timeline.takeSnapshot(self.state.players);
        }, 100);
    }
}