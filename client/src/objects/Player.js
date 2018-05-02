import DebugBody from './DebugBody';
import HealthBar from './HealthBar';

class Player extends Phaser.Sprite {
	constructor(game, x, y, health, angle) {
		super(game, x, y, 'spaceship_white');

		this.pad = this.game.plugins.add(Phaser.VirtualJoystick);
		
		this.game = game;
		this.health = health;
		this.maxHealth = 100;
		this.angle = angle;
		this.level = 1;
		this.exp = 0;
		this.expAmount = 0;
		this.points = 0;
		this.angleRate = 200;
		this.lastUpdate = Date.now() + this.angleRate;
		this.dest = {x: x, y: y, angle: this.angle};
		this.stats = {
			firerate: 1,
			speed: 1,
			damage: 1,
			health: 1
		}

		//Emitter
	    this.emitter = this.game.add.emitter(0, 0, 100);
	    this.emitter.makeParticles('deathParticle');
	    this.emitter.gravity = 0;

		//Sprite
		this.anchor.setTo(0.5, 0.5);
		this.scale.setTo(0.75, 0.75);

		// UI
		this.statTextGroup = this.game.add.group();
		this.statButtonGroup = this.game.add.group();
		
		//Healthbar
		this.playerHealthBar = new HealthBar(this.game, {
			x: this.x, 
			y: this.y + 64,
			width: 64,
			height: 8,
			animationDuration: 10
		});

		//Experience bar
		this.expBar = new HealthBar(this.game, {
			x: 100, 
			y: 50,
			width: 128,
			height: 16,
			animationDuration: 200
		});
		this.expBar.setPercent(0);

		// Text
		this.levelText = this.game.add.bitmapText(156, 100, 'font', 'Level: ' + this.level, 32);
		this.pointsText = this.game.add.bitmapText(156, 225, 'font', 'Points: ' + this.points, 23);
		this.firerateText = this.game.add.bitmapText(156, 250, 'font', 'Firerate: ' + this.stats.firerate, 23);
		this.speedText = this.game.add.bitmapText(156, 275, 'font', 'Speed: ' + this.stats.speed, 23);
		this.damageText = this.game.add.bitmapText(156, 300, 'font', 'Damage: ' + this.stats.damage, 23);
		this.healthText = this.game.add.bitmapText(156, 325, 'font', 'Health: ' + this.stats.health, 23);


		this.statTextGroup.add(this.levelText);
		this.statTextGroup.add(this.pointsText);
		this.statTextGroup.add(this.firerateText);
		this.statTextGroup.add(this.speedText);
		this.statTextGroup.add(this.damageText);
		this.statTextGroup.add(this.healthText);

		this.statTextGroup.forEach(item => {
			item.anchor.setTo(1, 1);
			item.inputEnabled = true;
			let name = item.text.substring(0, item.text.indexOf(':')).toLowerCase();

			if (['firerate', 'speed', 'damage', 'health'].toString().includes(name)) {
				item.alpha = 0.5;
				item.name = name;
				item.events.onInputDown.add(this.addStat, this);
				item.events.onInputOver.add(this.textOver, this);
				item.events.﻿﻿﻿onInputOut.add(this.textOut, this);
			}
		});

		this.expBar.barSprite.fixedToCamera = true;
		this.expBar.bgSprite.fixedToCamera = true;
		this.statTextGroup.fixedToCamera = true;
		this.statButtonGroup.fixedToCamera = true;


		//Inputs
		this.game.input.activePointer.rightButton.onDown.add(this.playerControls, {moveUp: true});
		this.game.input.activePointer.rightButton.onUp.add(this.playerControls, {moveUp: false});
		this.game.input.activePointer.leftButton.onDown.add(this.playerShoot, {shoot: true});
		this.game.input.activePointer.leftButton.onUp.add(this.playerShoot, {shoot: false});

        this.stick = this.pad.addStick(0, 0, 200, 'arcade');
        this.stick.alignBottomLeft();

		this.stick.onDown.add(this.stickControls, {moveUp: true, _this: this});
		this.stick.onUp.add(this.stickControls, {moveUp: false, _this: this});

        this.buttonA = this.pad.addButton(0, 0, 'arcade', 'button1-up', 'button1-down');
        this.buttonA.alignBottomRight();
        this.buttonA.onDown.add(this.buttonShoot, {shoot: true, _this: this});
        this.buttonA.onUp.add(this.buttonShoot, {shoot: false, _this: this});

		this.game.add.existing(this);
		this.game.add.existing(this.statTextGroup);
	}

	update() {
		this.updateAngle();
		this.updatePlayerPos();
	}

	addStat(button, mouse) {
		if (this.points > 0) {
			this.game.room.send({pointsAdded: button.name});
			this.points--;
			this.updateText('points');
		}
	}

	textOver(button, mouse) {
		button.alpha = 1;
	}

	textOut(button, mouse) {
		button.alpha = 0.5;
	}

	addPoints() {
		this.points++;
		this.updateText('points');
	}

	setHealth(value) {
		this.playerHealthBar.setPercent((value/this.maxHealth) * 100);
	}

	updatePlayerPos() {
		let x = this.x + Math.sin(this.angle * Math.PI / 180);
		let y = this.y + Math.cos(this.angle * Math.PI / 180);
		this.x = this.lerp(x, this.dest.x, 0.1);
		this.y = this.lerp(y, this.dest.y, 0.1);
		let deg;
		if (this.stick.isDown) {
			deg = Phaser.Math.radToDeg(this.stick.rotation);
		} else {
			deg = Phaser.Math.radToDeg(this.game.physics.arcade.angleToPointer(this));
		}
		let shortestAngle = Phaser.Math.getShortestAngle(this.angle, Phaser.Math.wrapAngle(deg));
		this.angle = this.lerp(this.angle, (this.angle + shortestAngle), 0.1);
		this.playerHealthBar.setPosition(this.x, this.y + 55);
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

		this.updateText(type);
	}

	updateAngle() {
		if (this.lastUpdate < Date.now()) {
			let deg;

			if (this.stick.isDown) {
				deg = Phaser.Math.radToDeg(this.stick.rotation) + 90;
			} else {
				deg = Phaser.Math.radToDeg(this.game.physics.arcade.angleToPointer(this)) + 90;
			}
			let destAngle = deg < 0 ? deg + 360 : deg;
			this.game.room.send({updateAngle: Math.round(destAngle)});
			this.lastUpdate = Date.now() + this.angleRate;
		}
	}

	stickControls() {
		let t = this._this;
		t.game.room.send({moveUp: this.moveUp});
	}

	buttonShoot() {
		let t = this._this;
		t.game.room.send({shoot: this.shoot});
	}

	playerControls(t) {
		t.game.room.send({moveUp: this.moveUp});
	}

	playerShoot(t) {
		t.game.room.send({shoot: this.shoot});
	}

	updateText(type, text) {
		switch(type) {
			case 'level':
				this.levelText.text = 'Level: ' + this.level;
			break;
			case 'points':
				this.pointsText.text = 'Points: ' + this.points;
			break;
			case 'firerate':
				this.firerateText.text = 'Firerate: ' + this.stats.firerate;
			break;
			case 'speed':
				this.speedText.text = 'Speed: ' + this.stats.speed;
			break;
			case 'damage':
				this.damageText.text = 'Damage: ' + this.stats.damage;
			break;
			case 'health':
				this.healthText.text = 'Health: ' + this.stats.health;
			break;
		}
	}

	respawn() {
		this.game.camera.target = this;
		this.health = this.maxHealth;
		this.playerHealthBar.setPercent(100);
		this.alpha = 1;
		this.playerHealthBar.barSprite.alpha = 1;
		this.playerHealthBar.bgSprite.alpha = 1;
	}

	die() {
		this.game.camera.shake(0.01, 250);
		this.game.camera.target = null;
		this.emitter.x = this.x;
		this.emitter.y = this.y;
		this.emitter.start(true, 2000, null, 20);
		this.alpha = 0;
		this.playerHealthBar.barSprite.alpha = 0;
		this.playerHealthBar.bgSprite.alpha = 0;
	}

	leave() {
		this.playerHealthBar.barSprite.destroy();
		this.playerHealthBar.bgSprite.destroy();
	}

	lerp(a, b, n) {
		return (1 - n) * a + n * b;
	}
}

export default Player;