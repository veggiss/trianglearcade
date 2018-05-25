class Preload extends Phaser.State {

	preload() {
		this.game.load.image('spaceship_white', 'assets/spaceship_white.png');
		this.game.load.image('bit', 'assets/bit.png');
		this.game.load.image('powerUp', 'assets/powerUp.png');
		this.game.load.image('bullet', 'assets/bullet.png');
		this.game.load.image('seeker', 'assets/seeker.png');
		this.game.load.image('comet', 'assets/comet.png');
		this.game.load.image('deathParticle', 'assets/particle.png');
		this.game.load.image('button', 'assets/button.png');
		this.game.load.image('starfield', 'assets/starfield.png');
		this.game.load.image('actionbar', 'assets/actionbar.png');
		this.game.load.image('power_shield', 'assets/power_shield.png');
		this.game.load.image('power_magnet', 'assets/power_magnet.png');
		this.game.load.image('icon_generic', 'assets/icon_generic.png');
		this.game.load.image('icon_shield', 'assets/icon_shield.png');
		this.game.load.image('icon_heal', 'assets/icon_heal.png');
		this.game.load.image('icon_multishot', 'assets/icon_multishot.png');
		this.game.load.image('icon_seeker', 'assets/icon_seeker.png');
		this.game.load.image('icon_magnet', 'assets/icon_magnet.png');
		this.game.load.image('icon_warpspeed', 'assets/icon_warpspeed.png');

		this.load.atlas('arcade', 'assets/joystick/arcade-joystick.png', 'assets/joystick/arcade-joystick.json');

		this.game.load.bitmapFont('font', 'assets/font/font.png', 'assets/font/font.xml');
	
		this.game.load.script('joystick', 'scripts/joystick.js');
	}

	create() {
		this.game.state.start("Menu");
	}

}

export default Preload;
