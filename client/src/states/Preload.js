class Preload extends Phaser.State {

	preload() {
		this.load.image('starfield', 'assets/starfield.png');

		this.load.atlas('atlas', 'assets/images.png', 'assets/images.json', Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);

		this.load.atlas('generic', 'assets/joystick/generic-joystick.png', 'assets/joystick/generic-joystick.json');

		this.load.bitmapFont('font', 'assets/font/font.png', 'assets/font/font.xml');
	
		this.load.script('joystick', 'scripts/joystick.js');
	}

	create() {
		this.game.state.start("Menu");
	}

}

export default Preload;
