import MoveAndStopPlugin from "phaser-move-and-stop-plugin";
import Player from 'objects/Player';
import Client from 'objects/Client';
import Bullet from 'objects/Bullet';

class Main extends Phaser.State {

	create() {
		this.game.moveAndStop = this.game.plugins.add(MoveAndStopPlugin);
		this.game.stage.backgroundColor = '#b77d10';
		this.game.stage.disableVisibilityChange = true;
		this.background = this.game.add.tileSprite(0, 0, 1920, 1920, 'background');
		this.game.world.setBounds(0, 0, 1920, 1920);
		this.game.room = this.game.colyseus.join('game');
		this.clients = {};
		this.bullets = [];
		this.id;

		this.netListener();
	}

	update() {
		this.updateBullets();
	}

	netListener() {
		this.game.room.onMessage.add(message => {
			if (message.id) this.id = message.id;
			if (message.bullet) {
				let bullet = message.bullet;
				this.bullets.push(new Bullet(this.game, bullet.x, bullet.y, bullet.angle, bullet.id, this.bullets.length));
			}
			if (message.playerKilled) {
				this.clients[message.playerKilled].die();
			}
			if (message.playerRespawned) {
				this.clients[message.playerRespawned].respawn();
			}

			if(message.playerHit) {
				this.clients[message.playerHit.id].playerHealthBar.setPercent(message.playerHit.health);
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
	}

	updateBullets() {
		this.bullets.forEach((bullet, index, obj) => {
			if (!bullet.alive) {
				obj.splice(index, 1)
			} else {
				for (let id in this.clients) {
					if (bullet.owner !== id) {
						let dx = this.clients[id].x - bullet.x; 
						let dy = this.clients[id].y - bullet.y;
						let dist = Math.sqrt(dx * dx + dy * dy);

						if (dist < 30) {
							bullet.die();
							bullet.destroy();
							obj.splice(index, 1);
						}
					}
				}
			}
		});
	}
}

export default Main;

