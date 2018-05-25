class Comet extends Phaser.Sprite {
	constructor(game, x, y) {
		super(game, x, y, 'comet');
		this.id;
		this.game = game;
		this.anchor.setTo(0.5, 0.5);
		this.tint = '0x' + Math.floor(Math.random()*16777215).toString(16);
		this.originalTint = this.tint;
		this.autoCull = true;
		this.angle = Math.random() * 180;
		this.scale.setTo(0);
		this.scaleTween = this.game.add.tween(this.scale).to({x: 1, y: 1}, 1000, Phaser.Easing.Elastic.Out, true);
		this.kill();

		this.game.add.existing(this);
	}

	update() {
		this.rotation += 0.05;
	}
}

export default Comet;