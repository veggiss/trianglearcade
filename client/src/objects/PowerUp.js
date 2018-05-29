class PowerUp extends Phaser.Sprite {
	constructor(game, x, y) {
		super(game, x, y, 'atlas', 'powerup.png');
		
		this.id;
		this.target;
		this.sound;
		this.playSound = false;
		this.type = undefined;
		this.game = game;
		this.anchor.setTo(0.5);
		this.scale.setTo(0);
		this.scaleTween = this.game.add.tween(this.scale).to({x: 0.75, y: 0.75}, 6000, Phaser.Easing.Elastic.Out);
		this.kill();

		this.game.add.existing(this);
	}

	update() {
		this.rotation += 0.1;

		if (this.activated) {
			this.moveToTarget();
		}
	}

	moveToTarget() {
		if (this.target) {
			this.x = this.lerp(this.x, this.target.x, 0.13);
			this.y = this.lerp(this.y, this.target.y, 0.13);

			let dx = this.target.x - this.x; 
			let dy = this.target.y - this.y;
			let dist = Math.sqrt(dx * dx + dy * dy);

			if (dist < 25) {
				this.activated = false;
				this.type = undefined;
				this.kill();
				if (this.playSound && this.sound) {
					this.sound.play();
					this.playSound = false;
				}
			}
		}
	}

	lerp(a, b, n) {
		return (1 - n) * a + n * b;
	}
}

export default PowerUp;