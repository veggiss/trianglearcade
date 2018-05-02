import MoveAndStopPlugin from "phaser-move-and-stop-plugin";
import Player from 'objects/Player';
import Client from 'objects/Client';
import Bullet from 'objects/Bullet';
import Bit from 'objects/Bit';

class Main extends Phaser.State {

	create() {
		this.game.moveAndStop = this.game.plugins.add(MoveAndStopPlugin);
		this.game.stage.backgroundColor = '#000022';
		this.game.stage.disableVisibilityChange = true;
		this.game.world.setBounds(0, 0, 1920, 1920);

		this.starfield2 = this.add.tileSprite(0, 0, 1920, 1920, 'starfield2');
		this.starfield = this.add.tileSprite(0, 0, 1920, 1920, 'starfield');
		this.planet_blue = this.game.add.image(0, 0, 'planet_blue');
		this.starfield.fixedToCamera = true;
		this.starfield2.fixedToCamera = true;
		this.planet_blue.fixedToCamera = true
		this.starfield2.alpha = 0.5;

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
		this.starfield.tilePosition.set(-(this.game.camera.x * 0.07), -(this.game.camera.y * 0.07));
		this.starfield2.tilePosition.set(-(this.game.camera.x * 0.05), -(this.game.camera.y * 0.05));
		this.planet_blue.cameraOffset.set(-(this.game.camera.x * 0.2), -(this.game.camera.y * 0.2));
	}

	netListener() {
		this.game.room.onMessage.add(message => {
			if (message.me) {
				let me = message.me;
				this.id = me.id;
				this.clients[this.id] = new Player(this.game, me.x, me.y, me.health, me.angle);
				this.game.camera.follow(this.clients[this.id], Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);
			}

			if (message.bitHit) {
				let bit = this.findBit(message.bitHit.id);
				if (bit) {
					let player = this.clients[message.bitHit.player];
					bit.target = player;
					bit.activated = true;
				}
			}

			if (message.bullet) {
				let bullet = this.bulletPool.getFirstDead();
				bullet.owner = message.bullet.owner;
				bullet.id = message.bullet.id;
				bullet.angle = message.bullet.angle;
				bullet.timer = Date.now() + 1000;
				bullet.reset(message.bullet.x, message.bullet.y);
			}

			if (message.expGain) {
				let player = this.clients[this.id];
				player.exp = message.expGain.exp;
				player.expAmount = message.expGain.expAmount;
				player.expBar.setPercent((player.exp / player.expAmount) * 100);
			}

			if (message.levelUp) {
				this.clients[this.id].addPoints();
			}

			if (message.statUpgrade) {
				this.clients[this.id].upgradeStat(message.statUpgrade.type, message.statUpgrade.value);
			}

			if (message.playerAngle) {
				this.clients[message.playerAngle.id].dest.angle = message.playerAngle.angle;
			}
		});

		this.game.room.listen("players/:id/:variable", change => {
			if (change.operation === 'replace') {
				let player = this.clients[change.path.id];

				if (player) {
					switch(change.path.variable) {
						case 'x':
							player.dest.x = change.value;
						break;
						case 'y':
							player.dest.y = change.value;
						break;
						case 'health':
							player.playerHealthBar.setPercent((change.value / player.maxHealth) * 100);
						break;
						case 'alive':
							if (change.value) {
								player.respawn();
							} else {
								player.die();
							}
						break;
						case 'level':
							if (change.path.id !== this.id) {
								console.log("Player: " + change.path.id + " dinged to level " + change.value);
							} else {
								player.level = change.value;
								player.updateText('level');
							}
						break;
					}
				}
			}
		});

		this.game.room.listen("players/:id", change => {
			if (change.operation === "add") {
				if (change.path.id !== this.id) {
					this.clients[change.path.id] = new Client(this.game, change.value.x, change.value.y, change.value.health);
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
				if (bullet.id !== id) {
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