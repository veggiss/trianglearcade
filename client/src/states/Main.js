import Player from 'objects/Player';
import Client from 'objects/Client';
import Bullet from 'objects/Bullet';
import Seeker from 'objects/Seeker';
import Shockwave from 'objects/Shockwave';
import Bit from 'objects/Bit';
import PowerUp from 'objects/PowerUp';
import Comet from 'objects/Comet';

class Main extends Phaser.State {

	create() {
		this.game.stage.backgroundColor = '#021421';
		this.game.stage.disableVisibilityChange = true;
		this.game.world.setBounds(0, 0, 2400, 2000);
		this.game.onMobile = !this.game.device.desktop;
		
		//Background
		this.starfield = this.add.tileSprite(0, 0, 2400, 2000, 'atlas', 'starfield.png');
		this.starfield.fixedToCamera = true;
		this.starfield.alpha = 0.5;

		//Pools and network
		this.game.room = this.game.colyseus.join('game', {name: this.game.myName.toString()});
		this.planetGroup = this.game.add.group();
		this.bulletPool = this.game.add.group();
		this.bitsPool = this.game.add.group();
		this.powerUpPool = this.game.add.group();
		this.cometPool = this.game.add.group();
		this.seekerPool = this.game.add.group();
		this.shockwavePool = this.game.add.group();
		this.clientGroupIdle = this.game.add.group();
		this.clientGroupActive = this.game.add.group();
		this.playerGroup = this.game.add.group();
		this.messageTextGroup = this.game.add.group();
		this.forceFieldGroup = this.game.add.group();
		this.bitSounds = [];
		this.nextSound = 0;
		this.clients = {};
		this.id;

		//Force field and arrow pointing to it
		this.forceField = this.game.add.sprite(0, 0, 'atlas', 'shockwave.png');
		this.forceField.anchor.setTo(0.5);
		this.forceField.width = 800;
		this.forceField.height = 800;
		this.forceField.alpha = 0;
		this.arrow = this.game.add.sprite(0, 0, 'arrow');
		this.arrow.anchor.setTo(0, 0.5);
		this.arrow.alpha = 0;
		this.forceFieldGroup.add(this.forceField);

		//Message texts
		this.forceFieldText = this.game.add.bitmapText(this.game.canvas.width/2, 60, 'font', '', 26);
		this.forceFieldText.alpha = 0;
		this.forceFieldText.anchor.setTo(0.5);
		this.forceFieldText.tweenOut = this.game.add.tween(this.forceFieldText).to({alpha: 0}, 1000, Phaser.Easing.Linear.None);
		this.forceFieldText.tweenIn = this.game.add.tween(this.forceFieldText).to({alpha: 1}, 1000, Phaser.Easing.Linear.None);
		this.messageText = this.game.add.bitmapText(this.game.canvas.width/2, 90, 'font', '', 30);
		this.messageText.alpha = 0;
		this.messageText.anchor.setTo(0.5);
		this.messageText.tweenOut = this.game.add.tween(this.messageText).to({alpha: 0}, 1000, Phaser.Easing.Linear.None);
		this.messageText.tweenIn = this.game.add.tween(this.messageText).to({alpha: 1}, 5000, Phaser.Easing.Linear.None);
		this.messageText.tweenIn.onComplete.add(() => this.messageText.tweenOut.start());
		this.messageTextGroup.add(this.forceFieldText);
		this.messageTextGroup.add(this.messageText);
		this.messageTextGroup.fixedToCamera = true;
		//Sound
		this.sound_hit = this.game.add.audio('hit');
		this.sound_kill = this.game.add.audio('kill');
		this.sound_shoot = this.game.add.audio('shoot');
		this.sound_levelup = this.game.add.audio('levelup');
		this.sound_forcefield = this.game.add.audio('forcefield');
		for (let i = 1; i < 4; i++) {
			let sound = this.game.add.audio('bit_' + i);
			this.bitSounds.push(sound);
		}
		this.sound_forcefield.volume = 0.6;
		this.sound_kill.volume = 0.6;
		this.sound_hit.volume = 0.3;

		this.bulletPool.z = 1;
		this.bitsPool.z = 1;
		this.powerUpPool.z = 1;
		this.cometPool.z = 1;
		this.seekerPool.z = 1;
		this.clientGroupActive.z = 2;
		this.playerGroup.z = 3;
		this.messageTextGroup.z = 4;
		this.forceFieldGroup.z = 4;

		//Death particles
		this.deathEmitter = this.game.add.emitter(0, 0, 20);
		this.deathEmitter.makeParticles('atlas', 'particle.png');
		this.deathEmitter.setAlpha(1, 0, 2000);
		this.deathEmitter.setScale(3, 0, 3, 0, 2000);
		this.deathEmitter.lifespan = 2000;
		this.deathEmitter.gravity = 0;

	    this.createBulletPool();
	    this.createBitsPool();
	    this.createPowerUpPool();
	    this.createCometPool();
	    this.createShockwavePool();
	    this.createSeekerPool();
	    this.createClientPool();

		this.netListener();
	}

	update() {
		if (this.id) {
			this.updateBullets();
			this.updateVisiblePlayers();
			this.updateArrow();
			this.starfield.tilePosition.set(-(this.game.camera.x * 0.05), -(this.game.camera.y * 0.05));
		}
	}

	nextBitSound() {
		this.nextSound++;
		if (this.nextSound == 3) {
			this.nextSound = 0;
		}

		return this.nextSound;
	}

	setText(type, message) {
		if (type === 'forcefield') {
			this.forceFieldText.text = 'Seconds before wipe: ' + message;
			if (message < 10 && message > 0) {
				this.sound_forcefield.play();
			}
		} else if (type === 'message') {
			this.messageText.text = message;
			this.messageText.tweenIn.start();
			this.sound_forcefield.play();
		}
	}

	netListener() {
		this.game.room.onMessage.add(message => {
			if (message.me) {
				let me = message.me;
				this.id = me.id;
				this.clients[this.id] = new Player(this.game, -5000, -5000, 0, 100, 0);
				this.playerGroup.add(this.clients[this.id]);
				this.game.camera.follow(this.clients[this.id], Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);
				this.game.world.sort('z', Phaser.Group.SORT_ASCENDING);
			}

			if (message.bitHit) {
				let bit = this.findInGroup(message.bitHit.id, this.bitsPool);
				if (bit) {
					let player = this.clients[message.bitHit.player];
					if (player) {
						let sound = this.bitSounds[this.nextBitSound()];
						bit.target = player;
						if (sound && message.bitHit.player === this.id) {
							bit.playSound = true;
							bit.sound = sound;
						}
						bit.activated = true;

						if (message.bitHit.trap && message.bitHit.player === this.id) this.game.camera.shake(0.01, 50);
					}
				}
			}

			if (message.powerUpHit) {
				let powerup = this.findInGroup(message.powerUpHit.id, this.powerUpPool);
				if (powerup) {
					let player = this.clients[message.powerUpHit.id];
					if (player) {
						let sound = this.bitSounds[this.nextBitSound()];
						powerup.target = player;
						if (sound && message.powerUpHit.id === this.id) {
							powerup.playSound = true;
							powerup.sound = sound;
						}
						powerup.activated = true;
					}
				}
			}

			if (message.bullet) {
				let player = this.clients[message.bullet.id];
				if (player) {
					let bullet = this.bulletPool.getFirstDead();
					if (bullet) {
						bullet.id = message.bullet.id;
						bullet.angle = message.bullet.angle;
						bullet.timer = Date.now() + 1000;
						bullet.setTint(player.tint);
						bullet.setTrail(player.particles);
						bullet.setDest(message.bullet.x, message.bullet.y);
						bullet.reset(message.bullet.x, message.bullet.y);
						if (bullet.id === this.id) {
							this.sound_shoot.volume = 0.6;
							this.sound_shoot.play();
						} else {
							this.sound_shoot.volume = 0.1;
							if (!this.sound_shoot.isPlaying) this.sound_shoot.play();
						}
					}
				}
			}

			if (message.seeker) {
				let player = this.clients[message.seeker.owner];
				let target = this.clients[message.seeker.target];
				if (player) {
					let m = message.seeker;
					let seeker = this.seekerPool.getFirstDead();
					if (seeker) {
						seeker.id = m.owner;
						seeker.timer = Date.now() + 2000;
						seeker.setTint(player.tint);
						seeker.setTrail(player.particles);
						if (m.owner === this.id) {
							this.sound_shoot.volume = 0.6;
							this.sound_shoot.play();
						} else {
							this.sound_shoot.volume = 0.1;
							if (!this.sound_shoot.isPlaying) this.sound_shoot.play();
						}

						if (target) {
							seeker.target = target;
						} else {
							seeker.rotation = player.rotation;
							seeker.target = {alive: false}
						}
						seeker.reset(player.x, player.y);
					}
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
				this.sound_levelup.play();

				if (typeof(message.newPower) === 'number') {
					this.clients[this.id].ui.newPowerAvailable(message.newPower);
				}
			}

			if (message.statUpgrade) {
				this.clients[this.id].upgradeStat(message.statUpgrade.type, message.statUpgrade.value);
			}

			if (message.updateClient) {
				let m = message.updateClient;
				let client = this.clients[m.id];

				if (client) {
					if (m.id !== this.id) client.lastUpdate = Date.now() + 1000;

					if (!client.alive) {
						client.reset(m.x, m.y);
						client.alpha = 0;
					}

					client.dest.x = m.x;
					client.dest.y = m.y;
					client.setHealth(m.health);

					if (m.angle) client.dest.angle = m.angle - 90;

					if (m.active.length > 0) {
						client.powers.update(m.active);
					}
				}
			}

			if (message.leaderboard) {
				let player = this.clients[this.id];
				let m = message.leaderboard;
				if (player && player.ui) {
					player.ui.updateLeaderboard(m.lb);
					player.ui.scoreText.text = 'Score: ' + m.score;
					player.ui.posText.text = `Position: ${m.pos}/${m.lb.length}`;
				}
			}

			if (message.respawn) {
				let m = message.respawn;
				let player = this.clients[m.id];
				if (player) player.respawn(m.x, m.y);
			}

			if (message.death) {
				let m = message.death;
				let player = this.clients[m.id];
				if (player) {
					this.emitDeath(player);
					player.die();
					this.sound_kill.play();
				}
			}

			if (message.shockwave) {
				let m = message.shockwave;
				let shockwave = this.shockwavePool.getFirstDead();
				if (shockwave) {
					shockwave.start(m.x, m.y, this.clients[this.id].tint);

					for (let id in this.clients) {
						let player = this.clients[id]
						let dist = this.distanceBetween({x: m.x, y: m.y}, player);
						if (dist < 300) {
							setTimeout(() => {
								if (player.alive) {
									if (!player.powers.active.includes('shield')) {
										this.tweenTint(player, player.originalTint, 0xffffff, 50);
										if (id == this.id && m.id !== this.id) {
											this.game.camera.shake(0.01, 50);
										}
									}
								}
							}, dist * 1.5);
						}
					}
				}
			}

			if (message.message) {
				this.setText('message', message.message);
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
								player.nameLabel.text = `${player.name} (${change.value})`;
							} else {
								player.levelUp(change.value);
								player.nameLabel.text = `${this.game.myName} (${change.value})`;
							}
						break;
					}
				}
			}
		});

		this.game.room.listen("players/:id", change => {
			if (change.path.id && change.path.id !== this.id) {
				if (change.operation === "add") {
					let client = this.clientGroupIdle.getFirstDead();
					if (client) {
						this.clientGroupActive.add(client);

						client.revive(-500, -500);
						client.level = change.value.level;
						client.health = change.value.health;
						client.maxHealth = change.value.maxHealth;
						client.name = change.value.name;
						client.nameLabel.text = `${client.name} (${client.level})`;
						this.clients[change.path.id] = client;
						this.game.world.sort('z', Phaser.Group.SORT_ASCENDING);
					} else if (change.operation === "remove") {
						let client = this.clients[change.path.id];
						this.clientGroupIdle.add(client);
						client.die();

						delete this.clients[change.path.id];
					}
				}
			}
		});

		this.game.room.listen("bits/:id", change => {
			if (change.operation === 'add') {
				let bit = this.bitsPool.getFirstDead();
				if (bit) {
					bit.id = change.path.id;
					bit.scale.setTo(0);
					bit.reset(change.value.x, change.value.y);
					bit.scaleTween.start();
					if (change.value.trap) {
						let fakeBit = this.game.add.sprite(bit.x, bit.y, 'atlas', 'bit.png');
						fakeBit.scale.setTo(0);
						fakeBit.anchor.setTo(0.5);
						this.game.add.tween(fakeBit.scale).to({x: 4, y: 4}, 500, Phaser.Easing.Linear.none, true);
						let tween = this.game.add.tween(fakeBit).to({alpha: 0}, 500, Phaser.Easing.Linear.none, true);
						tween.onComplete.add(() => fakeBit.destroy());
					}
				}
			} else if (change.operation === 'remove') {
				setTimeout(() => {
					let bit = this.findInGroup(change.path.id, this.bitsPool);
					if (bit && bit.alive) bit.kill();
				}, 1000);
			}
		});

		this.game.room.listen("powerUps/:id", change => {
			if (change.operation === 'add') {
				let powerUp = this.powerUpPool.getFirstDead();
				if (powerUp) {
					powerUp.id = change.path.id;
					if (change.value.type === 'healthBoost') {
						powerUp.tint = 0x00A549;
					} else if (change.value.type === 'xpBoost') {
						powerUp.tint = 0xB7C9E5;
					}
					powerUp.reset(change.value.x, change.value.y);
					powerUp.scaleTween.start();
				}
			} else if (change.operation === 'remove') {
				setTimeout(() => {
					let powerUp = this.findInGroup(change.path.id, this.powerUpPool);
					if (powerUp && powerUp.alive) powerUp.kill();
				}, 1000);
			}
		});

		this.game.room.listen("comets/:id", change => {
			if (change.operation === 'add') {
				let comet = this.cometPool.getFirstDead();
				if (comet) {
					comet.id = change.path.id;
					comet.scale.setTo(0);				
					comet.reset(change.value.x, change.value.y);
					comet.scaleTween.start();
				}
			} else if (change.operation === 'remove') {
				let comet = this.findInGroup(change.path.id, this.cometPool);
				if (comet) {
					this.emitDeath(comet);
					comet.kill();
				}
			}
		});

		this.game.room.listen("deathWall/:variable", change => {
			if (change.operation === 'add') {
				switch (change.path.variable) {
					case 'x':
						this.forceField.x = change.value;
					break;
					case 'y':
						this.forceField.y = change.value;
					break;
					case 'active':
						if (change.value === true) {
							this.forceField.alpha = 1;
						} else if (change.value === false) {
							this.forceField.alpha = 0;
						}
					break;
					case 'timer':
						if (change.value > 0) {
							this.forceFieldText.tweenIn.start();
							this.setText('forcefield', change.value);
						}
					break;
				}
			} else if (change.operation === 'replace') {
				switch (change.path.variable) {
					case 'x':
						this.forceField.x = change.value;
					break;
					case 'y':
						this.forceField.y = change.value;
					break;
					case 'active':
						if (change.value === true) {
							this.forceField.alpha = 1;
							this.forceFieldText.tweenIn.start();
						} else if (change.value === false) {
							this.forceField.alpha = 0;
							this.forceFieldText.tweenOut.start();
						}
					break;
					case 'timer':
						if (change.value > 0) {
							this.setText('forcefield', change.value);
						}
					break;
				}
			}
		});
	}

	createBulletPool() {
		for (let i = 0; i < 50; i++) {
			this.bulletPool.add(new Bullet(this.game));
		}
	}

	createBitsPool() {
		for (let i = 0; i < 100; i++) {
			this.bitsPool.add(new Bit(this.game));
		}
	}

	createPowerUpPool() {
		for (let i = 0; i < 10; i++) {
			this.powerUpPool.add(new PowerUp(this.game));
		}
	}

	createCometPool() {
		for (let i = 0; i < 10; i++) {
			this.cometPool.add(new Comet(this.game));
		}
	}

	createSeekerPool() {
		for (let i = 0; i < 10; i++) {
			this.seekerPool.add(new Seeker(this.game));
		}
	}

	createShockwavePool() {
		for (let i = 0; i < 10; i++) {
			this.shockwavePool.add(new Shockwave(this.game));
		}
	}

	createClientPool() {
		for (let i = 0; i < 10; i++) {
			this.clientGroupIdle.add(new Client(this.game));
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
				let dist = this.distanceBetween(this.clients[this.id], target);

				if (dist < 950) {
					if (target.alive && target.alpha === 0 && target.lastUpdate > Date.now()) {
						target.x = target.dest.x;
						target.y = target.dest.y;
						this.game.add.tween(target).to({alpha: 1}, 500, Phaser.Easing.Linear.None, true);
						target.playerHealthBar.barSprite.alpha = 1;
						target.playerHealthBar.bgSprite.alpha = 1;
					}
				} else {
					if (target.alive && target.alpha === 1) {
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
			this.checkCollision(bullet);
		}, this);
		this.seekerPool.forEachAlive(seeker => {
			this.checkCollision(seeker);
		}, this);
	}

	updateArrow() {
		if (this.forceField.alpha == 1) {
			if (this.distanceBetween(this.clients[this.id], this.forceField) < 400) {
				this.arrow.alpha = 0;
			} else {
				this.arrow.alpha = 1;
				this.arrow.x = this.clients[this.id].x;
				this.arrow.y = this.clients[this.id].y;
				this.arrow.rotation = Phaser.Math.angleBetween(this.arrow.x, this.arrow.y, this.forceField.x, this.forceField.y);
			}
		} else {
			this.arrow.alpha = 0;
		}
	}

	checkCollision(bullet) {
		for (let id in this.clients) {
			if (bullet.id !== id) {
				if (this.clients[id].alive) {
					let player = this.clients[id];

					if (player.powers.active.includes('shield')) {
						if (this.distanceBetween(player, bullet) < 40) {
							let shooter = this.clients[bullet.id];
							if (shooter) {
								shooter.particles.emitHit(bullet.x, bullet.y);
								this.sound_hit.play();
							}
							bullet.kill();
						}
					} else {
						if (this.distanceBetween(player, bullet) < 25) {
							let shooter = this.clients[bullet.id];
							if (shooter) {
								shooter.particles.emitHit(bullet.x, bullet.y);
								this.tweenTint(player, player.originalTint, 0xffffff, 50);
								this.sound_hit.play();
							}

							bullet.kill();
						}
					}
				}
			}
		}

		this.cometPool.forEachAlive(comet => {
			if (this.distanceBetween(comet, bullet) < 25) {
				let player = this.clients[bullet.id];
				if (player) {
					player.particles.emitHit(bullet.x, bullet.y);
					this.tweenTint(comet, comet.originalTint, 0xffffff, 50);
					if (!this.sound_hit.isPlaying) this.sound_hit.play();
				}
				bullet.kill();
			}
		})
	}

	emitDeath(obj) {
		this.deathEmitter.x = obj.x;
		this.deathEmitter.y = obj.y;
		this.deathEmitter.start(true, 2000, null, 5);
	}


	tweenTint(obj, startColor, endColor, time) {
		let colorBlend = {step: 0};
		let colorTween = this.game.add.tween(colorBlend).to({step: 100}, time, Phaser.Easing.Circular.InOut, true, 0, 0, true);
		
		colorTween.onUpdateCallback(function() {      
			obj.tint = Phaser.Color.interpolateColor(startColor, endColor, 100, colorBlend.step);
		});
	}

	distanceBetween(point1, point2) {
		let dx = point1.x - point2.x; 
		let dy = point1.y - point2.y;
		return Math.sqrt(dx * dx + dy * dy);
	}
}

export default Main;