import Player from 'objects/Player';
import Client from 'objects/Client';
import Bullet from 'objects/Bullet';
import Bit from 'objects/Bit';
import PowerUp from 'objects/PowerUp';
import Comet from 'objects/Comet';

class Main extends Phaser.State {

	create() {
		this.game.stage.backgroundColor = '#021421';
		this.game.stage.disableVisibilityChange = true;
		this.game.world.setBounds(0, 0, 1920, 1920);
		this.game.onMobile = !this.game.device.desktop;
		this.game.time.advancedTiming = true;
		
		//Background
		this.starfield = this.add.tileSprite(0, 0, 1920, 1920, 'starfield2');
		this.starfield.fixedToCamera = true;
		this.starfield.alpha = 0.5;

		//Pools and network
		this.game.room = this.game.colyseus.join('game', {name: this.game.myName.toString()});
		this.bulletPool = this.game.add.group();
		this.bitsPool = this.game.add.group();
		this.powerUpPool = this.game.add.group();
		this.cometPool = this.game.add.group();
		this.visiblePlayers = [];
		this.clients = {};
		this.id;

	    this.createBulletPool();
	    this.createBitsPool();
	    this.createPowerUpPool();
	    this.createCometPool();

		this.netListener();
	}

	update() {
		if (this.id) {
			this.updateBullets();
			this.updateVisiblePlayers();
			this.starfield.tilePosition.set(-(this.game.camera.x * 0.05), -(this.game.camera.y * 0.05));
		}
	}

	netListener() {
		this.game.room.onMessage.add(message => {
			if (message.me) {
				let me = message.me;
				this.id = me.id;
				this.clients[this.id] = new Player(this.game, 0, 0, 100, 0);
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
				let player = this.clients[message.bullet.id];
				if (player) {
					let bullet = this.bulletPool.getFirstDead();
					bullet.owner = message.bullet.owner;
					bullet.id = message.bullet.id;
					bullet.angle = message.bullet.angle;
					bullet.speed = message.bullet.speed;
					bullet.timer = Date.now() + 400;
					bullet.setTint(player.tint);
					bullet.setTrail(player.particles);
					bullet.setDest(message.bullet.x, message.bullet.y);
					bullet.reset(message.bullet.x, message.bullet.y);
				}
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

			if (message.leaderboard) {
				let player = this.clients[this.id];
				if (player) {
					player.ui.updateLeaderboard(message.leaderboard);
				}
			}

			if (message.respawn) {
				let m = message.respawn;
				let player = this.clients[m.id];
				if (player) {
					player.respawn(m.x, m.y);
					let index = this.visiblePlayers.indexOf(m.id);
					if (index > -1) this.visiblePlayers.splice(index, 1);
				}
			}

			if (message.death) {
				let m = message.death;
				let player = this.clients[m.id];
				if (player) player.die();
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
						case 'level':
							if (change.path.id !== this.id) {
								// Message on ding?
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
				bit.scale.setTo(0);
				bit.reset(change.value.x, change.value.y);
				bit.scaleTween.start();
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
				comet.scale.setTo(0);				
				comet.reset(change.value.x, change.value.y);
				comet.scaleTween.start();
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

	updateVisiblePlayers() {
		for (let id in this.clients) {
			if (id !== this.id) {
				let target = this.clients[id];
				let dist = this.distranceBetween(this.clients[this.id], target);

				if (dist < 950) {
					if (target.alpha === 0) {
						target.x = target.dest.x;
						target.y = target.dest.y;
						this.game.add.tween(target).to({alpha: 1}, 500, Phaser.Easing.Linear.None, true);
						target.playerHealthBar.barSprite.alpha = 1;
						target.playerHealthBar.bgSprite.alpha = 1;
					}
				} else {
					if (target.alpha === 1) {
						target.playerHealthBar.barSprite.alpha = 0;
						target.playerHealthBar.bgSprite.alpha = 0;
						this.game.add.tween(target).to({alpha: 0}, 500, Phaser.Easing.Linear.None, true);
					}
				}
			}
		}
	}

	updateBullets() {
		this.bulletPool.forEachAlive(bullet => {
			for (let id in this.clients) {
				if (bullet.id !== id) {
					if (this.clients[id].alive) {
						let player = this.clients[id];

						if (this.distranceBetween(player, bullet) < 30) {
							let shooter = this.clients[bullet.id];
							if (shooter) shooter.particles.emitHit(bullet.x, bullet.y);
							bullet.kill();
						}
					}
				}
			}

			this.cometPool.forEachAlive(comet => {
				if (this.distranceBetween(comet, bullet) < 25) {
					let player = this.clients[bullet.id];
					if (player) player.particles.emitHit(bullet.x, bullet.y);
					bullet.kill();
				}
			})
		}, this);
	}

	distranceBetween(point1, point2) {
		let dx = point1.x - point2.x; 
		let dy = point1.y - point2.y;
		return Math.sqrt(dx * dx + dy * dy);
	}
}

export default Main;