import DebugBody from './DebugBody';
import HealthBar from './HealthBar';

class Client extends Phaser.Sprite {
	constructor(game, x, y, health) {
		super(game, x, y, 'spaceship_white');

		this.game = game;
		this.health = health;
		this.maxHealth = 100;
		this.angle = 0;
		this.dest = {x: x, y: y, angle: this.angle};

		//Emitter
	    this.emitter = this.game.add.emitter(0, 0, 100);
	    this.emitter.makeParticles('deathParticle');
	    this.emitter.gravity = 0;

	    //Sprite
	    this.scale.setTo(0.75, 0.75);
		this.anchor.setTo(0.5, 0.5);
		this.playerHealthBar = new HealthBar(this.game, {
			x: this.x, 
			y: this.y + 64,
			width: 64,
			height: 8,
			animationDuration: 10
		});

		this.game.add.existing(this);
	}

	update() {
		let x = this.x + Math.sin(this.angle * Math.PI / 180);
		let y = this.y + Math.cos(this.angle * Math.PI / 180);
		this.x = this.lerp(x, this.dest.x, 0.1);
		this.y = this.lerp(y, this.dest.y, 0.1);
		let shortestAngle = Phaser.Math.getShortestAngle(this.angle, Phaser.Math.wrapAngle(this.dest.angle - 90));
		this.angle = this.lerp(this.angle, (this.angle + shortestAngle), 0.075);
		this.playerHealthBar.setPosition(this.x, this.y + 55);
	}

	respawn() {
		this.health = 100;
		this.playerHealthBar.setPercent(100);
		this.alpha = 1;
		this.playerHealthBar.barSprite.alpha = 1;
		this.playerHealthBar.bgSprite.alpha = 1;
	}

	die() {
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

export default Client;