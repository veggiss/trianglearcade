class Preload extends Phaser.State {

	preload() {
		this.game.load.image('player', 'assets/player.png');
		this.game.load.image('spaceship_white', 'assets/spaceship_white.png');
		this.game.load.image('bit', 'assets/bit.png');
		this.game.load.image('powerUp', 'assets/powerUp.png');
		this.game.load.image('bullet', 'assets/bullet.png');
		this.game.load.image('deathParticle', 'assets/deathParticle.png');
		this.game.load.image('starfield', 'assets/starfield.png');
		this.game.load.image('starfield2', 'assets/starfield2.png');
		this.game.load.image('planet_blue', 'assets/planet_blue.png');

		this.load.atlas('arcade', 'assets/joystick/arcade-joystick.png', 'assets/joystick/arcade-joystick.json');

		this.game.load.bitmapFont('font', 'assets/font/font.png', 'assets/font/font.xml');
	
		this.game.load.script('joystick', 'scripts/joystick.js');
	}

	create() {
		this.game.state.start("Main");
	}

}

export default Preload;
