class Bit extends Phaser.Sprite {
	constructor(game, x, y) {
		super(game, x, y, 'bit');
		
		this.id;
		this.target;
		this.game = game;
		this.anchor.setTo(0.5, 0.5);
		this.tint = '0x' + Math.floor(Math.random()*16777215).toString(16);
		this.scale.setTo(0);
		this.rotation = Math.random() - 180;
		this.autoCull = true;
		let rs = (Math.random() * 0.2) + 0.5;
		this.scaleTween = this.game.add.tween(this.scale).to({x: rs, y: rs}, 500, Phaser.Easing.Linear.None, true);
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
				this.kill();
			}
		}
	}

	lerp(a, b, n) {
		return (1 - n) * a + n * b;
	}
}

export default Bit;