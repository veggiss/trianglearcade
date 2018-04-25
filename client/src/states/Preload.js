class Preload extends Phaser.State {

	preload() {
		this.game.load.image('player', 'assets/player.png');
		this.game.load.image('bit', 'assets/bit.png');
		this.game.load.image('bullet', 'assets/bullet.png');
		this.game.load.image('deathParticle', 'assets/deathParticle.png');
		this.game.load.image('background', 'assets/background.png');
	}

	create() {
		this.game.state.start("Main");
	}

}

export default Preload;
