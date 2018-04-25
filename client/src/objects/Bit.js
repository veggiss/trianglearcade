class Bit extends Phaser.Sprite {
	constructor(game, x, y) {
		super(game, x, y, 'bit');
		
		this.game = game;
		this.anchor.setTo(0.5, 0.5);
		this.activated = false;
		this.kill = false;
		this.target;

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
				this.destroy();
			}
		}
	}

	lerp(a, b, n) {
		return (1 - n) * a + n * b;
	}
}

export default Bit;