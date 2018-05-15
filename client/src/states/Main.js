import Player from 'objects/Player';
import Client from 'objects/Client';
import Bullet from 'objects/Bullet';
import Bit from 'objects/Bit';
import PowerUp from 'objects/PowerUp';
import Comet from 'objects/Comet';

class Main extends Phaser.State {

	create() {
		this.game.stage.backgroundColor = '#000022';
		this.game.stage.disableVisibilityChange = true;
		this.game.world.setBounds(0, 0, 1920, 1920);
		this.game.onMobile = !this.game.device.desktop;
		this.game.time.advancedTiming = true;
		
		//Background
		this.starfield = this.add.tileSprite(0, 0, 1920, 1920, 'starfield2');
		this.starfield.fixedToCamera = true;
		this.starfield.alpha = 0.5;

		//Pools and network
		this.game.room = this.game.colyseus.join('game');
		this.bulletPool = this.game.add.group();
		this.bitsPool = this.game.add.group();
		this.powerUpPool = this.game.add.group();
		this.cometPool = this.game.add.group();
		this.clients = {};
		this.id;

		//Emitters
	    this.emBulletHit = this.game.add.emitter(0, 0, 100);
	    this.emBulletHit.makeParticles('deathParticle');
	    this.emBulletHit.gravity = 0;

		this.bulletTrailer = this.game.add.emitter(0, 0, 100);
		this.bulletTrailer.makeParticles('deathParticle');
		this.bulletTrailer.setAlpha(1, 0, 600);
		this.bulletTrailer.setXSpeed(0, 0);
		this.bulletTrailer.setYSpeed(0, 0);
		this.bulletTrailer.setScale(0, 0.5, 0, 0.5, 400);
		this.bulletTrailer.frequency = 10;
		this.bulletTrailer.lifespan = 400;
		this.bulletTrailer.gravity = 0;

	    //Create bullets
	    this.createBulletPool();
	    this.createBitsPool();
	    this.createPowerUpPool();
	    this.createCometPool();

		this.netListener();
	}

	update() {
		this.updateBullets();
		this.starfield.tilePosition.set(-(this.game.camera.x * 0.05), -(this.game.camera.y * 0.05));
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
				let bit = this.findInGroup(message.bitHit.id, this.bitsPool);
				if (bit) {
					let player = this.clients[message.bitHit.player];
					bit.target = player;
					bit.activated = true;
				}
			}

			if (message.powerUpHit) {
				let powerup = this.findInGroup(message.powerUpHit.id, this.powerUpPool);
				if (powerup) {
					let player = this.clients[message.powerUpHit.player];
					powerup.target = player;
					powerup.activated = true;
				}
			}

			if (message.bullet) {
				let bullet = this.bulletPool.getFirstDead();
				bullet.owner = message.bullet.owner;
				bullet.id = message.bullet.id;
				bullet.angle = message.bullet.angle;
				bullet.speed = message.bullet.speed;
				bullet.timer = Date.now() + 400;
				bullet.setDest(message.bullet.x, message.bullet.y);
				bullet.setTint(this.clients[message.bullet.id].tint);
				bullet.reset(message.bullet.x, message.bullet.y);
			}

			if (message.expGain) {
				let player = this.clients[this.id];
				player.exp = message.expGain.exp;
				player.expAmount = message.expGain.expAmount;
				player.ui.expBar.setPercent((player.exp / player.expAmount) * 100);
			}

			if (message.levelUp) {
				this.clients[this.id].ui.addPoints();
			}

			if (message.statUpgrade) {
				this.clients[this.id].upgradeStat(message.statUpgrade.type, message.statUpgrade.value);
			}

			if (message.updateClient) {
				let m = message.updateClient;
				let client = this.clients[m.id];
				if (client) {
					client.dest.x = m.x;
					client.dest.y = m.y;
					client.dest.angle = m.angle - 90;
					client.setHealth(m.health);
				}
			}

			if (message.clientDeath) {
				let m = message.clientDeath;
				let client = this.clients[m.id];

				if (client) {
					client.die();
				}
			}

			if (message.clientRespawn) {
				let m = message.clientRespawn;
				let client = this.clients[m.id];

				if (client) {
					client.respawn();
				}
			}
		});

		this.game.room.listen("players/:id/:variable", change => {
			if (change.operation === 'replace') {
				let player = this.clients[change.path.id];
				if (player) {
					switch(change.path.variable) {
						case 'maxHealth':
							player.maxHealth = change.value;
							player.setHealth(player.health);
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
								player.levelUp(change.value);
							}
						break;
					}
				}
			}
		});

		this.game.room.listen("players/:id", change => {
			if (change.operation === "add") {
				if (change.path.id !== this.id) {
					this.clients[change.path.id] = new Client(this.game, change.value.level, change.value.health, change.value.maxHealth);
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
			} else if (change.operation === 'remove') {
				setTimeout(() => {
					let bit = this.findInGroup(change.path.id, this.bitsPool);

					if (bit && !bit.activated) bit.kill();
				}, 1000);
			}
		});

		this.game.room.listen("powerUps/:id", change => {
			if (change.operation === 'add') {
				let powerUp = this.powerUpPool.getFirstDead();
				powerUp.id = change.path.id;
				powerUp.type = change.value.type;
				powerUp.reset(change.value.x, change.value.y);
			} else if (change.operation === 'remove') {
				setTimeout(() => {
					let powerUp = this.findInGroup(change.path.id, this.powerUpPool);

					if (powerUp && !powerUp.activated) powerUp.kill();
				}, 1000);
			}
		});

		this.game.room.listen("comets/:id", change => {
			if (change.operation === 'add') {
				let comet = this.cometPool.getFirstDead();
				comet.id = change.path.id;
				comet.reset(change.value.x, change.value.y);
			} else if (change.operation === 'remove') {
				let comet = this.findInGroup(change.path.id, this.cometPool);
				if (comet) comet.kill();
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

	createPowerUpPool() {
		for (let i = 0; i < 10; i++) {
			this.powerUpPool.add(new PowerUp(this.game));
		}
	}

	createCometPool() {
		for (let i = 0; i < 20; i++) {
			this.cometPool.add(new Comet(this.game));
		}
	}

	findInGroup(id, group) {
		let foundItem;

		group.forEachAlive(item => {
			if (item.id === id) {
				item.id = id;
				foundItem = item;
			}
		});

		return foundItem;
	}

	updateBullets() {
		this.bulletPool.forEachAlive(bullet => {
			for (let id in this.clients) {
				if (bullet.id !== id) {
					if (this.clients[id].alive) {
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
			}
		}, this);
	}
}

export default Main;