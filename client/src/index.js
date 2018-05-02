import {Client} from 'colyseus.js';
import Boot from 'states/Boot';
import Preload from 'states/Preload';
import Main from 'states/Main';

class Game extends Phaser.Game {
	constructor() {
		super(1, 1, Phaser.WEBGL, 'trianglearcade');
		
		const endpoint = (window.location.hostname.indexOf("herokuapp") === -1)
			? "ws://localhost:3000" // - Local
			: `${window.location.protocol.replace("https", "wss")}//${window.location.hostname}`; // - Heroku/remote
		this.colyseus = new Client(endpoint);
		this.state.add('Boot', Boot, false);
		this.state.add('Preload', Preload, false);
		this.state.add('Main', Main, false);
		this.state.start('Boot');
	}
}

new Game();
