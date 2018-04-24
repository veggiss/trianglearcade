import DebugBody from './DebugBody';

class Player extends Phaser.Sprite {
	constructor(game, x, y) {
		super(game, x, y, 'player');
		
		this.game = game;
		this.dest = {x: x, y: y, angle: this.angle};

		//Emitter
	    this.emitter = this.game.add.emitter(0, 0, 100);
	    this.emitter.makeParticles('deathParticle');
	    this.emitter.gravity = 0;

		//Sprite
		this.anchor.setTo(0.5, 0.5);
		this.game.input.activePointer.rightButton.onDown.add(this.playerControls, {moveUp: true});
		this.game.input.activePointer.rightButton.onUp.add(this.playerControls, {moveUp: false});
		this.game.input.activePointer.leftButton.onDown.add(this.playerShoot, {shoot: true});
		this.game.input.activePointer.leftButton.onUp.add(this.playerShoot, {shoot: false});

		this.game.add.existing(this);

		//new DebugBody(this.game, this.dest.x, this.dest.y, 'circle', {host: this, radius: 25});
	}

	update() {
		let x = this.x + Math.sin(this.angle * Math.PI / 180);
		let y = this.y + Math.cos(this.angle * Math.PI / 180);
		this.x = this.lerp(x, this.dest.x, 0.1);
		this.y = this.lerp(y, this.dest.y, 0.1);
		let shortestAngle = Phaser.Math.getShortestAngle(this.angle, Phaser.Math.wrapAngle(this.dest.angle));
		this.angle = this.lerp(this.angle, (this.angle + shortestAngle), 0.1);
	}

	playerControls(t) {
		t.game.room.send({moveUp: this.moveUp});
	}

	playerShoot(t) {
		t.game.room.send({shoot: this.shoot});
	}

	die() {
		this.emitter.x = this.x;
		this.emitter.y = this.y;
		this.emitter.start(true, 2000, null, 20);
		this.alpha = 0;
	}

	lerp(a, b, n) {
		return (1 - n) * a + n * b;
	}
}

export default Player;