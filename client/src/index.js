import {Client} from 'colyseus.js';
import Boot from 'states/Boot';
import Preload from 'states/Preload';
import Menu from 'states/Menu';
import Main from 'states/Main';

const config = {
	width: window.innerWidth,
	height: window.innerHeight,
	renderer: Phaser.WEBGL,
	parent: 'trianglearcade'
}

class Game extends Phaser.Game {
	constructor() {
		super(config);
		
		const endpoint = (window.location.hostname.indexOf("herokuapp") === -1)
			? "ws://localhost:3000" // - Local
			: `${window.location.protocol.replace("http", "ws")}//${window.location.hostname}`; // - Heroku/remote
		this.colyseus = new Client(endpoint);

		this.state.add('Boot', Boot, false);
		this.state.add('Preload', Preload, false);
		this.state.add('Menu', Menu, false);
		this.state.add('Main', Main, false);
		this.state.start('Boot');
	}
}

new Game();
