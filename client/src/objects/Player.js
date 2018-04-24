import DebugBody from './DebugBody';
import HealthBar from './HealthBar';

class Player extends Phaser.Sprite {
	constructor(game, x, y, health) {
		super(game, x, y, 'player');
		
		this.game = game;
		this.health = health;
		this.dest = {x: x, y: y, angle: this.angle};

		//Emitter
	    this.emitter = this.game.add.emitter(0, 0, 100);
	    this.emitter.makeParticles('deathParticle');
	    this.emitter.gravity = 0;

		//Sprite
		this.anchor.setTo(0.5, 0.5);
		this.playerHealthBar = new HealthBar(this.game, {
			x: this.x, 
			y: this.y + 64,
			width: 64,
			height: 8,
			animationDuration: 50
		});

		//Inputs
		this.game.input.activePointer.rightButton.onDown.add(this.playerControls, {moveUp: true});
		this.game.input.activePointer.rightButton.onUp.add(this.playerControls, {moveUp: false});
		this.game.input.activePointer.leftButton.onDown.add(this.playerShoot, {shoot: true});
		this.game.input.activePointer.leftButton.onUp.add(this.playerShoot, {shoot: false});

		this.game.add.existing(this);
	}

	update() {
		let x = this.x + Math.sin(this.angle * Math.PI / 180);
		let y = this.y + Math.cos(this.angle * Math.PI / 180);
		this.x = this.lerp(x, this.dest.x, 0.1);
		this.y = this.lerp(y, this.dest.y, 0.1);
		let shortestAngle = Phaser.Math.getShortestAngle(this.angle, Phaser.Math.wrapAngle(this.dest.angle));
		this.angle = this.lerp(this.angle, (this.angle + shortestAngle), 0.1);
		this.playerHealthBar.setPosition(this.x, this.y + 55);
	}

	playerControls(t) {
		t.game.room.send({moveUp: this.moveUp});
	}

	playerShoot(t) {
		t.game.room.send({shoot: this.shoot});
	}

	respawn() {
		this.game.camera.target = this;
		this.health = 100;
		this.playerHealthBar.setPercent(100);
		this.alpha = 1;
		this.playerHealthBar.barSprite.alpha = 1;
		this.playerHealthBar.bgSprite.alpha = 1;
	}

	die() {
		this.game.camera.shake(0.01, 250);
		this.game.camera.target = null;
		this.emitter.x = this.x;
		this.emitter.y = this.y;
		this.emitter.start(true, 2000, null, 20);
		this.alpha = 0;
		this.playerHealthBar.barSprite.alpha = 0;
		this.playerHealthBar.bgSprite.alpha = 0;
	}

	leave() {
		this.playerHealthBar.barSprite.destroy();
		this.playerHealthBar.bgSprite.destroy();
	}

	lerp(a, b, n) {
		return (1 - n) * a + n * b;
	}
}

export default Player;