class Comet extends Phaser.Sprite {
	constructor(game, x, y) {
		super(game, x, y, 'comet');
		this.id;
		this.game = game;
		this.anchor.setTo(0.5, 0.5);
		this.kill();

		this.game.add.existing(this);
	}

	update() {
		//this.rotation = 0.005;
	}
}

export default Comet;