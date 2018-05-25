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
		this.deg = 0;
		this.exp = 0;
		this.expAmount = 0;
		this.angleRate = 100;
		this.lastUpdate = Date.now() + this.angleRate;
		this.tint = '0x' + Math.floor(Math.random()*16777215).toString(16);
		this.originalTint = this.tint;
		this.dest = {x: x, y: y, angle: this.angle};

		this.stats = {
			level: 1,
			points: 0,
			firerate: 1,
			speed: 1,
			damage: 1,
			health: 1,
			acceleration: 1,
			angulation: 1
		}

		//Sprite
		this.scale.setTo(0.75, 0.75);
		this.anchor.setTo(0.5);
		//Emitters and particles
		this.particles = new Particles(this.game, this.tint);
		//Powers container
		this.powers = new Powers(this.game, this);
		
		//Healthbar
		this.playerHealthBar = new HealthBar(this.game, {
			x: this.x, 
			y: this.y + 64,
			width: 64,
			height: 8,
			animationDuration: 10
		});

		this.kill();
		this.playerHealthBar.barSprite.alpha = 0;
		this.playerHealthBar.bgSprite.alpha = 0;

		//Inputs
		if (this.game.onMobile) {
	        this.stick = this.pad.addStick(0, 0, 200, 'arcade');
	        this.stick.alignBottomLeft();

			this.stick.onDown.add(this.playerControls, this, 1, true);
			this.stick.onUp.add(this.playerControls, this, 1, false);

	        this.buttonA = this.pad.addButton(0, 0, 'arcade', 'button1-up', 'button1-down');
	        this.buttonA.alignBottomRight();
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

        //Add player to stage
		this.game.add.existing(this);
	}

	update() {
		this.updateAngle();
		this.updatePlayerPos();
	}

	setHealth(value) {
		this.playerHealthBar.setPercent((value/this.maxHealth) * 100);
	}

	updatePlayerPos() {
		let x = this.x + Math.sin(this.angle * Math.PI / 180);
		let y = this.y + Math.cos(this.angle * Math.PI / 180);
		this.x = this.lerp(x, this.dest.x, 0.1);
		this.y = this.lerp(y, this.dest.y, 0.1);

		let shortestAngle = Phaser.Math.getShortestAngle(this.angle, Phaser.Math.wrapAngle(this.dest.angle));
		this.angle = this.lerp(this.angle, (this.angle + shortestAngle), 0.1);
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
			case 'acceleration':
				this.stats.acceleration++;
			break;
			case 'angulation':
				this.stats.angulation++;
			break;
		}

		this.ui.updateText(type);
	}

	updateAngle() {
		if (this.lastUpdate < Date.now()) {
			let deg;

			if (this.game.onMobile) {
				deg = this.stick.isDown ? Phaser.Math.radToDeg(this.stick.rotation) + 90 : this.deg + 90;
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
		this.game.room.send({shoot: obj.isDown});
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