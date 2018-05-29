class Bit extends Phaser.Sprite {
	constructor(game, x, y) {
		super(game, x, y, 'atlas', 'bit.png');
		
		this.id;
		this.target;
		this.sound;
		this.playSound = false;
		this.game = game;
		this.anchor.setTo(0.5, 0.5);
		this.tint = '0x' + Math.floor(Math.random()*16777215).toString(16);
		this.scale.setTo(0);
		this.angle = Math.floor(Math.random() * 360);
		let rs = (Math.random() * 0.3) + 0.5;
		this.scaleTween = this.game.add.tween(this.scale).to({x: rs, y: rs}, 1000, Phaser.Easing.Elastic.Out);
		
		this.kill();
	}

	update() {
		this.angle += 10;
		if (this.activated) {
			this.moveToTarget();
		}
	}

	moveToTarget() {
		if (this.target) {
			this.x = this.lerp(this.x, this.target.x, 0.16);
			this.y = this.lerp(this.y, this.target.y, 0.16);

			let dx = this.target.x - this.x; 
			let dy = this.target.y - this.y;
			let dist = Math.sqrt(dx * dx + dy * dy);

			if (dist < 25) {
				this.activated = false;
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

export default Bit;