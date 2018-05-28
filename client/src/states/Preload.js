class Preload extends Phaser.State {

	preload() {
		this.load.image('starfield', 'assets/starfield.png');

		this.load.atlas('atlas', 'assets/images.png', 'assets/images.json', Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);

		this.load.atlas('generic', 'assets/joystick/generic-joystick.png', 'assets/joystick/generic-joystick.json');

		this.load.bitmapFont('font', 'assets/font/font.png', 'assets/font/font.xml');
	
		this.load.script('joystick', 'scripts/joystick.js');

		//Sound
		this.game.load.audio('bit_1', 'assets/sound/bit_1.ogg');
		this.game.load.audio('bit_2', 'assets/sound/bit_2.ogg');
		this.game.load.audio('bit_3', 'assets/sound/bit_3.ogg');
		this.game.load.audio('shoot', 'assets/sound/shoot.ogg');
		this.game.load.audio('hit', 'assets/sound/hit.ogg');
		this.game.load.audio('kill', 'assets/sound/kill.ogg');
		this.game.load.audio('levelup', 'assets/sound/levelup.ogg');
	}

	create() {
		this.game.state.start("Menu");
	}

}

export default Preload;
