class Comet extends Phaser.Sprite {
	constructor(game, x, y) {
		super(game, x, y, 'comet');
		this.id;
		this.game = game;
		this.anchor.setTo(0.5, 0.5);
		this.tint = '0x' + Math.floor(Math.random()*16777215).toString(16);
		this.autoCull = true;
		this.angle = Math.random() * 180;
		this.kill();

		this.game.add.existing(this);
	}

	update() {
		this.rotation += 0.05;
	}
}

export default Comet;