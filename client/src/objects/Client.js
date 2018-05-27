import Particles from './Particles';
import HealthBar from './HealthBar';
import Powers from './Powers';

class Client extends Phaser.Sprite {
	constructor(game, level, health, maxHealth) {
		super(game, 0, 0, 'spaceship_white');

		this.game = game;
		this.health = 0;
		this.maxHealth = 0;
		this.level = 0;
		this.angle = 0;
		this.tint = '0x' + Math.floor(Math.random()*16777215).toString(16);
		this.originalTint = this.tint;
		this.autoCull = true;
		this.alpha = 0;
		this.dead = false;
		this.dest = {x: 0, y: 0, angle: this.angle};
		this.healthBarGroup = this.game.add.group();
		this.healthBarGroup.z = 2;

	    //Sprite
	    this.scale.setTo(0.75);
		this.anchor.setTo(0.5);
		//Particles and emitters
		this.particles = new Particles(this.game, this.tint);
		//Powers container
		this.powers = new Powers(this.game, this);

		this.playerHealthBar = new HealthBar(this.game, {
			x: this.x, 
			y: this.y + 64,
			width: 64,
			height: 8,
			animationDuration: 10
		});
		this.playerHealthBar.barSprite.alpha = 0;
		this.playerHealthBar.bgSprite.alpha = 0;
		this.healthBarGroup.add(this.playerHealthBar.bgSprite);
		this.healthBarGroup.add(this.playerHealthBar.barSprite);
		this.kill();
	}

	update() {
		if (this.alive) {
			this.x = this.lerp(this.x, this.dest.x, 0.1);
			this.y = this.lerp(this.y, this.dest.y, 0.1);

			let shortestAngle = Phaser.Math.getShortestAngle(this.angle, Phaser.Math.wrapAngle(this.dest.angle));
			this.angle = this.lerp(this.angle, (this.angle + shortestAngle), 0.075);
			this.playerHealthBar.setPosition(this.x, this.y + 55);
			if (this.alive && this.alpha === 1) {
				this.particles.playerMove(this.x, this.y);
			}
		}
	}

	respawn(x, y) {
		this.dest.x = x;
		this.dest.y = y;
		this.x = x;
		this.y = y;
		this.reset(x, y);
	}

	die() {
		this.kill();
		this.alpha = 0;
		this.playerHealthBar.barSprite.alpha = 0;
		this.playerHealthBar.bgSprite.alpha = 0;
	}

	setHealth(value) {
		this.playerHealthBar.setPercent((value/this.maxHealth) * 100);
	}

	lerp(a, b, n) {
		return (1 - n) * a + n * b;
	}
}

export default Client;