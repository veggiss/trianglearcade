import Particles from './Particles';
import HealthBar from './HealthBar';
import Powers from './Powers';
import UI from './UI';

class Player extends Phaser.Sprite {
	constructor(game, x, y, health, angle, color) {
		super(game, x, y, 'spaceship_white');

		this.pad = this.game.plugins.add(Phaser.VirtualJoystick);
		this.game = game;
		this.health = health;
		this.maxHealth = 100;
		this.angle = angle;
		this.exp = 0;
		this.expAmount = 0;
		this.angleRate = 200;
		this.lastUpdate = Date.now() + this.angleRate;
		this.tint = '0x' + Math.floor(Math.random()*16777215).toString(16);
		this.originalTint = this.tint;
		this.dest = {x: x, y: y, angle: this.angle};

		this.stats = {
			level: 0,
			points: 0,
			firerate: 0,
			speed: 0,
			damage: 0,
			health: 0
		}

		//Sprite
		this.scale.setTo(0.75);
		this.anchor.setTo(0.5);
		
		//Emitters and particles
		this.particles = new Particles(this.game, this.tint);
		//Powers container
		this.powers = new Powers(this.game, this);

		//Inputs
		if (this.game.onMobile) {
	        this.stick = this.pad.addStick(0, 0, 200, 'generic');
	        this.stick.scale = 0.75;
	        this.stick.alignBottomLeft(50, 20);

			this.stick.onDown.add(this.playerControls, this, 1, true);
			this.stick.onUp.add(this.playerControls, this, 1, false);

	        this.buttonA = this.pad.addButton(0, 0, 'generic', 'button1-up', 'button1-down');
	        this.buttonA.alignBottomRight(50, 20);
	        this.buttonA.onDown.add(this.playerShoot, this, 1, true);
	        this.buttonA.onUp.add(this.playerShoot, this, 1, false);
        } else {
			this.game.input.activePointer.rightButton.onDown.add(this.playerControls, this, 1, true);
			this.game.input.activePointer.rightButton.onUp.add(this.playerControls, this, 1, false);
			this.game.input.activePointer.leftButton.onDown.add(this.playerShoot, this, 1, true);
			this.game.input.activePointer.leftButton.onUp.add(this.playerShoot, this, 1, false);
        }

		//UI
		this.ui = new UI(this.game, this.stats);
		this.playerHealthBar = this.ui.healthbar;

        //Add player to stage
        this.kill();
		this.game.add.existing(this);
	}

	update() {
		this.updateAngle();
		this.updatePlayerPos();
	}

	setHealth(value) {
		this.playerHealthBar.setPercent((value/this.maxHealth) * 100);
	}

	getMagnitude() {
		return Math.sqrt(this.x * this.x + this.y * this.y)
	}

	updatePlayerPos() {
		this.x = this.lerp(this.x, this.dest.x, 0.1);
		this.y = this.lerp(this.y, this.dest.y, 0.1);

		let destAngle;

		if (this.game.onMobile) {
			destAngle = this.stick.angle;
		} else {
			destAngle = Phaser.Math.radToDeg(this.game.physics.arcade.angleToPointer(this));
		}

		let shortestAngle = Phaser.Math.getShortestAngle(this.angle, destAngle);
		this.angle = this.lerp(this.angle, (this.angle + shortestAngle), 0.075);
		this.playerHealthBar.setPosition(this.x, this.y + 55);
	}

	levelUp(value) {
		this.stats.level = value;
		this.ui.updateText('level', value);
	}

	upgradeStat(type, value) {
		switch(type) {
			case 'firerate':
				this.stats.firerate++;
			break;
			case 'speed':
				this.stats.speed++;
			break;
			case 'damage':
				this.stats.damage++;
			break;
			case 'health':
				this.stats.health++;
				this.maxHealth = value;
			break;
		}

		this.ui.updateText(type);
	}

	updateAngle() {
		if (this.lastUpdate < Date.now()) {
			let deg;

			if (this.game.onMobile) {
				deg = this.stick.angle + 90;
			} else {
				deg = Phaser.Math.radToDeg(this.game.physics.arcade.angleToPointer(this)) + 90;
			}

			let destAngle = deg < 0 ? deg + 360 : deg;
			this.game.room.send({updateAngle: Math.round(destAngle)});
			this.lastUpdate = Date.now() + this.angleRate;
			if (this.alive) {
				this.particles.playerMove(this.x, this.y);
			}
		}
	}

	playerControls(obj) {
		this.game.room.send({moveUp: obj.isDown});
	}

	playerShoot(obj) {
		if (this.game.onMobile) {
			this.game.room.send({shoot: obj.isDown});
		} else {
			if (obj.parent.targetObject == null) this.game.room.send({shoot: obj.isDown});
		}
	}

	respawn(x, y) {
		this.game.camera.target = this;
		this.health = this.maxHealth;
		this.playerHealthBar.setPercent(100);
		this.dest.x = x;
		this.dest.y = y;
		this.x = x;
		this.y = y;
		this.reset(x, y);
		this.playerHealthBar.barSprite.alpha = 1;
		this.playerHealthBar.bgSprite.alpha = 1;
	}

	die() {
		this.game.camera.shake(0.01, 250);
		this.game.camera.target = null;
		this.playerHealthBar.barSprite.alpha = 0;
		this.playerHealthBar.bgSprite.alpha = 0;
		this.kill();
	}

	lerp(a, b, n) {
		return (1 - n) * a + n * b;
	}
}

export default Player;