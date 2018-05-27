class Shockwave extends Phaser.Sprite {
	constructor(game, x, y) {
		super(game, x, y, 'shockwave');

		this.game = game;
		this.alpha = 1;
		this.anchor.setTo(0.5);

		this.fadeOut = this.game.add.tween(this).to({alpha: 0}, 500, Phaser.Easing.Linear.none);
		this.tweenIn = this.game.add.tween(this.scale).to({x: 3, y: 3}, 500, Phaser.Easing.Linear.none);
		this.tweenIn.onComplete.add(() => this.kill());
		this.kill();
	}

	start(x, y, tint) {
		this.alpha = 1;
		this.tint = tint;
		this.scale.setTo(0);
		this.reset(x, y);
		this.tweenIn.start();
		this.fadeOut.start();
	}
}

export default Shockwave;