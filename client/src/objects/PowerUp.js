class PowerUp extends Phaser.Sprite {
	constructor(game, x, y) {
		super(game, x, y, 'powerUp');
		
		this.id;
		this.target;
		this.type = undefined;
		this.game = game;
		this.anchor.setTo(0.5, 0.5);
		this.kill();

		this.game.add.existing(this);
	}

	update() {
		if (this.activated) {
			this.moveToTarget();
		}
	}

	moveToTarget() {
		if (this.target) {
			this.x = this.lerp(this.x, this.target.x, 0.1);
			this.y = this.lerp(this.y, this.target.y, 0.1);

			let dx = this.target.x - this.x; 
			let dy = this.target.y - this.y;
			let dist = Math.sqrt(dx * dx + dy * dy);

			if (dist < 25) {
				this.activated = false;
				this.type = undefined;
				this.kill();
			}
		}
	}

	lerp(a, b, n) {
		return (1 - n) * a + n * b;
	}
}

export default PowerUp;