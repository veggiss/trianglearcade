import HealthBar from './HealthBar';
//import Player from './Player';

class UI {
	constructor(game, stats) {
		this.game = game;
		this.stats = stats;

		this.statTextGroup = this.game.add.group();
		this.lbTextGroup = this.game.add.group();
		this.actionbarGroup = this.game.add.group();
		this.heroPowerBtnGroup = this.game.add.group();
		this.hotkeyList = [];
		let hotkeys = ['Q', 'W', 'E', 'R'];

		if (!this.game.onMobile) {
		    let key_q = game.input.keyboard.addKey(Phaser.Keyboard.Q);
		    let key_w = game.input.keyboard.addKey(Phaser.Keyboard.W);
		    let key_e = game.input.keyboard.addKey(Phaser.Keyboard.E);
		    let key_r = game.input.keyboard.addKey(Phaser.Keyboard.R);
		    this.hotkeyList.push(key_q);
		    this.hotkeyList.push(key_w);
		    this.hotkeyList.push(key_e);
		    this.hotkeyList.push(key_r);
		}

		//Experience bar
		this.expBar = new HealthBar(this.game, {
			x: 100, 
			y: 50,
			width: 128,
			height: 16,
			animationDuration: 200
		});
		this.expBar.setPercent(0);

		// Stat UI
		this.levelText = this.game.add.bitmapText(156, 100, 'font', 'Level: ' + 1, 32);
		this.pointsText = this.game.add.bitmapText(156, 225, 'font', 'Points: ' + 0, 23);
		this.firerateText = this.game.add.bitmapText(156, 250, 'font', 'Firerate: ' + 1, 23);
		this.speedText = this.game.add.bitmapText(156, 275, 'font', 'Speed: ' + 1, 23);
		this.damageText = this.game.add.bitmapText(156, 300, 'font', 'Damage: ' + 1, 23);
		this.healthText = this.game.add.bitmapText(156, 325, 'font', 'Health: ' + 1, 23);
		this.accelerationText = this.game.add.bitmapText(156, 350, 'font', 'Acceleration: ' + 1, 23);
		this.angulationText = this.game.add.bitmapText(156, 375, 'font', 'Angulation: ' + 1, 23);

		this.statTextGroup.add(this.levelText);
		this.statTextGroup.add(this.pointsText);
		this.statTextGroup.add(this.firerateText);
		this.statTextGroup.add(this.speedText);
		this.statTextGroup.add(this.damageText);
		this.statTextGroup.add(this.healthText);
		this.statTextGroup.add(this.accelerationText);
		this.statTextGroup.add(this.angulationText);

		this.statTextGroup.forEach(item => {
			item.anchor.setTo(1, 1);
			item.inputEnabled = true;
			let name = item.text.substring(0, item.text.indexOf(':')).toLowerCase();

			if (['firerate', 'speed', 'damage', 'health', 'acceleration', 'angulation'].toString().includes(name)) {
				item.alpha = 0.5;
				item.name = name;
				item.events.onInputDown.add(this.addStat, this);
				item.events.onInputOver.add(this.textOver, this);
				item.events.﻿﻿﻿onInputOut.add(this.textOut, this);
			}
		});

		// Leaderboard UI
		this.lbHeader = this.game.add.bitmapText(window.innerWidth - 100, 25, 'font', 'Leaderboard', 32);
		this.lbHeader.anchor.setTo(0.5);
		this.lbText = [];
		let spacing = 0;

		for (let i = 0; i < 10; i++) {
			spacing += 22;
			let text = this.game.add.bitmapText(this.lbHeader.x, this.lbHeader.y + spacing, 'font', '', 23);
			text.anchor.setTo(0.5);
			text.alpha = 0.5;
			this.lbText.push(text);
			this.lbTextGroup.add(text);
		}

		this.lbTextGroup.add(this.lbHeader);

		//Actionbar UI
		let spaceX = window.innerWidth/2 - 134;
		for (let i = 0; i < 4; i++) {
			let actionbar = this.game.add.sprite(spaceX, window.innerHeight - 60, 'actionbar');
			let newPowerIcon = this.game.add.sprite(0, 0, 'icon_generic');
			let cooldownText = this.game.add.bitmapText(0, 0, 'font', '', 30);
			let hotkeyIcon;
			if (!this.game.onMobile) {
				hotkeyIcon = this.game.add.bitmapText(-32, 32, 'font', `[${hotkeys[i]}]`, 20);
				hotkeyIcon.anchor.setTo(0, 1);
			}


			newPowerIcon.scale.setTo(0);
			newPowerIcon.anchor.setTo(0.5);
			newPowerIcon.kill();

			cooldownText.anchor.setTo(0.5);
			cooldownText.kill();

			actionbar.anchor.setTo(0.5);
			actionbar.alpha = 0.75;
			actionbar.inputEnabled = true;
			actionbar.powerNumber = i;
			actionbar.cooldown = Date.now();
			actionbar.timer = this.game.time.create();
			actionbar.cooldownText = cooldownText;

			actionbar.events.onInputOver.add(this.buttonOver, this);
			actionbar.events.﻿﻿﻿onInputOut.add(this.buttonOut, this);

			actionbar.cooldownTween = this.game.add.tween(cooldownText.scale).to({x: 1, y: 1}, 1000, Phaser.Easing.Elastic.Out);
			actionbar.show = this.game.add.tween(newPowerIcon.scale).to({x: 1, y: 1}, 1000, Phaser.Easing.Elastic.Out);

			actionbar.cooldownTween.onStart.add(() => this.countCooldown(actionbar));
			actionbar.show.onStart.add(() => newPowerIcon.revive());
			actionbar.hide = () => newPowerIcon.kill();

			actionbar.addChild(newPowerIcon);
			actionbar.addChild(cooldownText);

			if (!this.game.onMobile) {
				actionbar.addChild(hotkeyIcon);
			}
			this.actionbarGroup.add(actionbar);

			spaceX += actionbar.width + 10;
		}

		//Choose heropower UI
		this.choosetext = this.game.add.bitmapText(window.innerWidth/2, window.innerHeight - (window.innerHeight * 0.32), 'font', 'Choose hero power:', 26);
		this.choosetext.anchor.setTo(0.5);

		this.opt1Button = this.game.add.sprite(-50, 50, 'icon_generic');
		this.opt1Text = this.game.add.bitmapText(0, 20, 'font', '', 20);
		this.opt2Button = this.game.add.sprite(50, 50, 'icon_generic');
		this.opt2Text = this.game.add.bitmapText(0, 20, 'font', '', 20);

		this.opt1Button.opt = 0;
		this.opt2Button.opt = 1;
		this.opt1Text.anchor.setTo(0.5);
		this.opt2Text.anchor.setTo(0.5);
		this.opt1Button.anchor.setTo(0.5);
		this.opt2Button.anchor.setTo(0.5);
		this.opt1Button.inputEnabled = true;
		this.opt2Button.inputEnabled = true;
		this.opt1Button.addChild(this.opt1Text);
		this.opt2Button.addChild(this.opt2Text);
		this.opt1Button.events.onInputDown.add(this.sendPowerUpgrade, this);
		this.opt1Button.events.onInputOver.add(this.buttonOver, this);
		this.opt1Button.events.﻿﻿﻿onInputOut.add(this.buttonOut, this);
		this.opt2Button.events.onInputDown.add(this.sendPowerUpgrade, this);
		this.opt2Button.events.onInputOver.add(this.buttonOver, this);
		this.opt2Button.events.﻿﻿﻿onInputOut.add(this.buttonOut, this);

		this.choosetext.addChild(this.opt1Button);
		this.choosetext.addChild(this.opt2Button);

		this.choosetext.alpha = 0;
		this.showHeroBtns = this.game.add.tween(this.choosetext).to({alpha: 1}, 250, Phaser.Easing.Linear.None);
		this.hideHeroBtns = this.game.add.tween(this.choosetext).to({alpha: 0}, 250, Phaser.Easing.Linear.None);
		this.showHeroBtns.onStart.add((btn) => btn.revive(), this);
		this.hideHeroBtns.onComplete.add((btn) => btn.kill(), this);

		/*this.game.scale.setResizeCallback(() => { //--- This event has to be removed before changing state
		    this.lbHeader.x = window.innerWidth - 100;
		}, this);*/

		this.expBar.barSprite.fixedToCamera = true;
		this.expBar.bgSprite.fixedToCamera = true;
		this.statTextGroup.fixedToCamera = true;
		this.lbTextGroup.fixedToCamera = true;
		this.actionbarGroup.fixedToCamera = true;
		this.choosetext.fixedToCamera = true;

		for(let i = 0; i < 4; i++) {
			this.newPowerAvailable(i);
		}

		return this;
	}

	countCooldown(bar) {
		let delay = 30;
		let loop = this.game.time.events.loop(Phaser.Timer.SECOND, () => {
			delay--;
			bar.cooldownText.text = delay;
			if (delay <= 0) {
				this.game.time.events.remove(loop);
				bar.cooldownText.kill();
			}
		}, this);

		bar.cooldownText.text = delay;
		bar.cooldownText.revive();
	}

	updateLeaderboard(leaderboard) {
		this.lbText.forEach(item => {
			item.text = '';
		})

		leaderboard.forEach((item, index, obj) => {
			this.lbText[index].text = `${item.name}: ${item.score}`;
		});
	}

	updateText(type, text) {
		switch(type) {
			case 'level':
				this.levelText.text = 'Level: ' + this.stats.level;
			break;
			case 'points':
				this.pointsText.text = 'Points: ' + this.stats.points;
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
			case 'acceleration':
				this.accelerationText.text = 'Acceleration: ' + this.stats.acceleration;
			break;
			case 'angulation':
				this.angulationText.text = 'Angulation: ' + this.stats.angulation;
			break;
		}
	}

	newPowerAvailable(index) {
		let actionbar = this.actionbarGroup.getAt(index);
		actionbar.show.start();
		actionbar.events.onInputDown.add(this.showPowerOption, {text: this.getPowerTexts(index), _this: this});

		if (!this.game.onMobile) {
			let key = this.hotkeyList[index];
			key.onDown.add(this.showPowerOption, {text: this.getPowerTexts(index), _this: this});
		}
	}

	showPowerOption() {
		let _this = this._this;
		let text = this.text;

		_this.opt1Text.text = text.opt1Text;
		_this.opt2Text.text = text.opt2Text;
		_this.opt1Button.loadTexture(text.btn1Texture);
		_this.opt2Button.loadTexture(text.btn2Texture);
		_this.opt1Button.actionbarIndex = text.index;
		_this.opt2Button.actionbarIndex = text.index;

		_this.showHeroBtns.start();
	}

	getPowerTexts(index) {
		let texts = {index: index};
		switch(index) {
			case 0:
				texts.opt1Text = 'Shield';
				texts.opt2Text = 'Heal';
				texts.btn1Texture = 'icon_shield';
				texts.btn2Texture = 'icon_heal';
			break;
			case 1:
				texts.opt1Text = 'Seeker';
				texts.opt2Text = 'Multishot';
				texts.btn1Texture = 'icon_seeker';
				texts.btn2Texture = 'icon_multishot';
			break;
			case 2:
				texts.opt1Text = 'Magnet';
				texts.opt2Text = 'Warpspeed';
				texts.btn1Texture = 'icon_magnet';
				texts.btn2Texture = 'icon_warpspeed';
			break;
			case 3:
				texts.opt1Text = 'Trap';
				texts.opt2Text = 'Bomb';
				texts.btn1Texture = 'icon_magnet';
				texts.btn2Texture = 'icon_warpspeed';
			break;
		}

		return texts;
	}

	sendPowerUpgrade(button) {
		this.hideHeroBtns.start();

		let chosenPower = this.game.add.sprite(0, 0, button.key);
		chosenPower.anchor.setTo(0.5);
		let actionbar = this.actionbarGroup.getAt(button.actionbarIndex);
		actionbar.hide();
		actionbar.addChild(chosenPower);
		actionbar.events.onInputDown.removeAll();
		actionbar.events.onInputDown.add(this.activateHeroPower, this, 0, actionbar);
		if (!this.game.onMobile) {
			let key = this.hotkeyList[button.actionbarIndex];
			key.onDown.removeAll();
			key.onDown.add(this.activateHeroPower, this, 0, actionbar);
		}

		this.game.room.send({powerChosen: {option: button.opt, index: actionbar.powerNumber}});
	}

	activateHeroPower(BomfunkMCs, bar) {
		if (bar.cooldown < Date.now()) {
			bar.cooldownTween.start();
			this.game.room.send({activatePower: bar.powerNumber});
			bar.cooldown = Date.now() + 30000;
		}
	}

	addPoints() {
		this.stats.points++;
		this.updateText('points', this.stats.points);
	}

	addStat(button, mouse) {
		if (this.stats.points > 0) {
			this.game.room.send({pointsAdded: button.name});
			this.stats.points--;
			this.updateText('points', this.stats.points);
		}
	}

	textOver(button, mouse) {
		button.alpha = 1;
		button.scale.setTo(1.3);
	}

	textOut(button, mouse) {
		button.alpha = 0.5;
		button.scale.setTo(1);
	}

	buttonOver(button) {
		button.alpha = 1;
	}

	buttonOut(button) {
		button.alpha = 0.75;
	}
}

export default UI;