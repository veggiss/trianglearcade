class Preload extends Phaser.State {

	preload() {
		this.game.load.image('spaceship_white', 'assets/spaceship_white.png');
		this.game.load.image('bit', 'assets/bit.png');
		this.game.load.image('powerUp', 'assets/powerUp.png');
		this.game.load.image('bullet', 'assets/bullet.png');
		this.game.load.image('comet', 'assets/comet.png');
		this.game.load.image('deathParticle', 'assets/particle.png');
		this.game.load.image('starfield2', 'assets/starfield2.png');

		this.load.atlas('arcade', 'assets/joystick/arcade-joystick.png', 'assets/joystick/arcade-joystick.json');

		this.game.load.bitmapFont('font', 'assets/font/font.png', 'assets/font/font.xml');
	
		this.game.load.script('joystick', 'scripts/joystick.js');
	}

	create() {
		this.game.state.start("Menu");
	}

}

export default Preload;
