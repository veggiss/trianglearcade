import DebugBody from './DebugBody';
import HealthBar from './HealthBar';

class Client extends Phaser.Sprite {
	constructor(game, level, health, maxHealth) {
		super(game, 0, 0, 'spaceship_white');

		this.game = game;
		this.health = health;
		this.maxHealth = maxHealth;
		this.level = level;
		this.angle = 0;
		this.tint = '0x' + Math.floor(Math.random()*16777215).toString(16);
		this.dest = {x: 0, y: 0, angle: this.angle};

		/*//Emitter
	    this.emitter = this.game.add.emitter(0, 0, 100);
	    this.emitter.makeParticles('deathParticle');
	    this.emitter.gravity = 0;

		this.spaceJuice = this.game.add.emitter(0, 0, 20);
		this.spaceJuice.makeParticles('spaceJuiceParticle');
		this.spaceJuice.setAlpha(1, 0, 2000);
		this.spaceJuice.setRotation(50, 400);
		this.spaceJuice.setScale(0, 10, 0, 10, 2000);
		this.spaceJuice.setXSpeed(0, 0);
		this.spaceJuice.setYSpeed(0, 0);
		this.spaceJuice.gravity = 0;
		this.spaceJuice.children.forEach(child => {
			child.tint = this.tint;
		});*/

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
		let shortestAngle = Phaser.Math.getShortestAngle(this.angle, Phaser.Math.wrapAngle(this.dest.angle));
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
		/*this.emitter.x = this.x;
		this.emitter.y = this.y;
		this.emitter.start(true, 2000, null, 20);*/
		this.alpha = 0;
		this.playerHealthBar.barSprite.alpha = 0;
		this.playerHealthBar.bgSprite.alpha = 0;
	}

	setHealth(value) {
		this.playerHealthBar.setPercent((value/this.maxHealth) * 100);
	}

	leave() {
		this.playerHealthBar.barSprite.destroy();
		this.playerHealthBar.bgSprite.destroy();
		//this.spaceJuice.destroy();
	}

	lerp(a, b, n) {
		return (1 - n) * a + n * b;
	}
}

export default Client;