import MoveAndStopPlugin from "phaser-move-and-stop-plugin";
import Player from 'objects/Player';
import Client from 'objects/Client';
import Bullet from 'objects/Bullet';
import Bit from 'objects/Bit';

class Main extends Phaser.State {

	create() {
		this.game.moveAndStop = this.game.plugins.add(MoveAndStopPlugin);
		this.game.stage.backgroundColor = '#b77d10';
		this.game.stage.disableVisibilityChange = true;
		this.background = this.game.add.tileSprite(0, 0, 1920, 1920, 'background');
		this.game.world.setBounds(0, 0, 1920, 1920);
		this.game.room = this.game.colyseus.join('game');
		this.bulletPool = this.game.add.group();
		this.bitsPool = this.game.add.group();
		this.clients = {};
		this.id;

		//Emitter
	    this.emBulletHit = this.game.add.emitter(0, 0, 100);
	    this.emBulletHit.makeParticles('deathParticle');
	    this.emBulletHit.gravity = 0;

	    //Create bullets
	    this.createBulletPool();
	    this.createBitsPool();

		this.netListener();
	}

	update() {
		this.updateBullets();
	}

	netListener() {
		this.game.room.onMessage.add(message => {
			if (message.id) this.id = message.id;

			if (message.bullet) {
				let bullet = this.bulletPool.getFirstDead();
				bullet.owner = message.bullet.owner;
				bullet.id = message.bullet.id;
				bullet.angle = message.bullet.angle;
				bullet.timer = Date.now() + 1000;
				bullet.reset(message.bullet.x, message.bullet.y);
			}

			if (message.playerKilled) {
				this.clients[message.playerKilled].die();
			}

			if (message.playerRespawned) {
				this.clients[message.playerRespawned].respawn();
			}

			if (message.playerHit) {
				this.clients[message.playerHit.id].playerHealthBar.setPercent(message.playerHit.health);
			}

			if (message.bitHit) {
				let bit = this.findBit(message.bitHit.id);
				if (bit) {
					let player = this.clients[message.bitHit.player];
					bit.target.x = player.x;
					bit.target.y = player.y;
					bit.activated = true;
				}
			}
		});

		this.game.room.listen("players/:id/:axis", change => {
			if (change.operation === 'replace') {
				if (change.path.axis === 'x') {
					this.clients[change.path.id].dest.x = change.value;
				} else if (change.path.axis === 'y') {
					this.clients[change.path.id].dest.y = change.value;
				}
			}
		});

		this.game.room.listen("players/:id/:angle", change => {
			if (change.operation === 'replace') {
				if (change.path.angle === 'angle') {
					this.clients[change.path.id].dest.angle = change.value;
				}
			}
		});

		this.game.room.listen("players/:id", change => {
			if (change.operation === "add") {
				if (change.path.id !== this.id) {
					this.clients[change.path.id] = new Client(this.game, change.value.x, change.value.y, change.value.health);
				} else {
					this.clients[change.path.id] = new Player(this.game, change.value.x, change.value.y, change.value.health);
					this.game.camera.follow(this.clients[change.path.id], Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);
				}
			} else if (change.operation === "remove") {
				this.clients[change.path.id].leave();
				this.clients[change.path.id].destroy();
				delete this.clients[change.path.id];
			}
		});

		this.game.room.listen("bits/:id", change => {
			if (change.operation === 'add') {
				let bit = this.bitsPool.getFirstDead();
				bit.id = change.path.id;
				bit.reset(change.value.x, change.value.y);
			}
		});
	}

	createBulletPool() {
		for (let i = 0; i < 200; i++) {
			this.bulletPool.add(new Bullet(this.game));
		}
	}

	createBitsPool() {
		for (let i = 0; i < 120; i++) {
			this.bitsPool.add(new Bit(this.game));
		}
	}

	findBit(id) {
		let foundBit;

		this.bitsPool.forEachAlive(bit => {
			if (bit.id === id) {
				bit.id = id;
				foundBit = bit;
			}
		});

		return foundBit;
	}

	updateBullets() {
		this.bulletPool.forEachAlive(bullet => {
			for (let id in this.clients) {
				if (bullet.owner !== id) {
					let dx = this.clients[id].x - bullet.x; 
					let dy = this.clients[id].y - bullet.y;
					let dist = Math.sqrt(dx * dx + dy * dy);

					if (dist < 30) {
						bullet.kill();
						this.emBulletHit.x = bullet.x;
						this.emBulletHit.y = bullet.y;
						this.emBulletHit.start(true, 500, null, 5);
					}
				}
			}
		}, this);
	}
}

export default Main;

