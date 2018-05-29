import HealthBar from './HealthBar';
//import Player from './Player';

class UI {
	constructor(game, stats) {
		this.game = game;
		this.stats = stats;
		this.maxStats = 10;

		this.expBarGroup = this.game.add.group();
		this.statTextGroup = this.game.add.group();
		this.lbTextGroup = this.game.add.group();
		this.actionbarGroup = this.game.add.group();
		this.actionbarGroup_stat = this.game.add.group();
		this.hotkeyList = [];
		this.hotkey_statList = [];
		let hotkeys = ['Q', 'W', 'E', 'R'];
		let hotkeys_stat = ['1', '2', '3', '4'];
		let stat_label = ['Firerate', 'Speed', 'Damage', 'Health'];

		if (!this.game.onMobile) {
			//Power keys
		    let key_q = game.input.keyboard.addKey(Phaser.Keyboard.Q);
		    let key_w = game.input.keyboard.addKey(Phaser.Keyboard.W);
		    let key_e = game.input.keyboard.addKey(Phaser.Keyboard.E);
		    let key_r = game.input.keyboard.addKey(Phaser.Keyboard.R);

		    //Stat keys
		    let key_1 = game.input.keyboard.addKey(Phaser.Keyboard.ONE);
		    let key_2 = game.input.keyboard.addKey(Phaser.Keyboard.TWO);
		    let key_3 = game.input.keyboard.addKey(Phaser.Keyboard.THREE);
		    let key_4 = game.input.keyboard.addKey(Phaser.Keyboard.FOUR);

		    this.hotkeyList.push(key_q);
		    this.hotkeyList.push(key_w);
		    this.hotkeyList.push(key_e);
		    this.hotkeyList.push(key_r);

		    this.hotkey_statList.push(key_1);
		    this.hotkey_statList.push(key_2);
		    this.hotkey_statList.push(key_3);
		    this.hotkey_statList.push(key_4);
		}


		//Experience bar
		this.expBar = new HealthBar(this.game, {
			x: this.game.canvas.width/2 - 5, 
			y: this.game.canvas.height - 20,
			width: 324,
			height: 24,
			animationDuration: 200,
			bg: {
				color: '#021421'
			},
			bar: {
				color: '#15354D'
			}
		});
		this.expBar.setPercent(0);

		this.expBar_bar = this.game.add.sprite(this.expBar.x, this.expBar.y, 'atlas', 'actionbar_bar.png');
		this.expBar_bar.anchor.setTo(0.5);
		this.expBar_text = this.game.add.bitmapText(0, 0, 'font', 'XP', 16);
		this.expBar_text.anchor.setTo(0.5);
		this.expBar_text.alpha = 0.5;
		this.expBar_bar.addChild(this.expBar_text);
		this.expBarGroup.alpha = 0.75;
		this.expBarGroup.add(this.expBar.bgSprite);
		this.expBarGroup.add(this.expBar.barSprite);
		this.expBarGroup.add(this.expBar_bar);

		// Stat UI
		let padding = 190;
		this.nameText = this.game.add.bitmapText(20, padding += 22, 'font', this.game.myName, 25);
		this.posText = this.game.add.bitmapText(20, padding += 22, 'font', 'Position:', 25);
		this.scoreText = this.game.add.bitmapText(20, padding += 22, 'font', 'Score:', 25);
		this.levelText = this.game.add.bitmapText(20, padding += 22, 'font', 'Level: 0', 25);
		this.pointsText = this.game.add.bitmapText(20, 20, 'font', 'Points available: 0', 17);

		this.statTextGroup.add(this.nameText);
		this.statTextGroup.add(this.scoreText);
		this.statTextGroup.add(this.posText);
		this.statTextGroup.add(this.levelText);
		this.statTextGroup.add(this.pointsText);

		this.statTextGroup.forEach(item => {
			item.anchor.setTo(0, 0.5);
			item.alpha = 0.75;
		});

		if (!this.game.onMobile) {
			this.hotkey_statList.forEach((key, i) => {
				key.name = stat_label[i].toLowerCase();
				key.onDown.add(this.addStat, this);
			});
		}

		// Leaderboard UI
		this.lbHeader = this.game.add.bitmapText(this.game.canvas.width - 100, 25, 'font', 'Leaderboard', 32);
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

		//Power actionbar UI
		let spaceX = this.game.canvas.width/2 - 134;
		for (let i = 0; i < 4; i++) {
			let actionbar = this.game.add.sprite(spaceX, this.game.canvas.height - 75, 'atlas', 'actionbar.png');
			let chosenPower = this.game.add.sprite(0, 0, null);
			let newPowerIcon = this.game.add.sprite(0, 0, 'atlas', 'icon_generic.png');
			let cooldownText = this.game.add.bitmapText(0, 0, 'font', '', 40);
			let hotkeyIcon;

			if (!this.game.onMobile) {
				hotkeyIcon = this.game.add.bitmapText(-32, 32, 'font', `[${hotkeys[i]}]`, 20);
				hotkeyIcon.anchor.setTo(0, 1);
				this.lbTextGroup.add(hotkeyIcon);
			}

			chosenPower.anchor.setTo(0.5);

			newPowerIcon.scale.setTo(0);
			newPowerIcon.anchor.setTo(0.5);
			newPowerIcon.kill();

			cooldownText.anchor.setTo(0.5);
			cooldownText.tint = 0xFF0000;
			cooldownText.kill();

			actionbar.anchor.setTo(0.5);
			actionbar.alpha = 0.75;
			actionbar.inputEnabled = true;
			actionbar.powerNumber = i;
			actionbar.cooldown = Date.now();
			actionbar.timer = this.game.time.create();
			actionbar.chosenPower = chosenPower;
			actionbar.cooldownText = cooldownText;
			actionbar.newPowerIcon = newPowerIcon;

			actionbar.events.onInputOver.add(this.buttonOver, this);
			actionbar.events.﻿﻿﻿onInputOut.add(this.buttonOut, this);

			actionbar.cooldownTween = this.game.add.tween(cooldownText.scale).to({x: 1, y: 1}, 1000, Phaser.Easing.Elastic.Out);
			actionbar.show = this.game.add.tween(newPowerIcon.scale).to({x: 1, y: 1}, 1000, Phaser.Easing.Elastic.Out);

			actionbar.cooldownTween.onStart.add(() => this.countCooldown(actionbar));
			actionbar.show.onStart.add(() => newPowerIcon.revive());

			actionbar.addChild(chosenPower);
			actionbar.addChild(newPowerIcon);
			actionbar.addChild(cooldownText);
			if (!this.game.onMobile) actionbar.addChild(hotkeyIcon);
			this.actionbarGroup.add(actionbar);

			spaceX += actionbar.width + 10;
		}

		//Stat actionbar UI
		let spaceY = 50;
		for (let i = 0; i < 4; i++) {
			let actionbar = this.game.add.sprite(15, spaceY, 'atlas', 'actionbar_stat.png');
			let label = this.game.add.bitmapText(20, 0, 'font', `${stat_label[i]}`, 20);
			let stat = this.game.add.bitmapText(118, 0, 'font', '0', 20);
			let add = this.game.add.sprite(155, 0, 'atlas', 'actionbar_add.png');

			if (!this.game.onMobile) {
				let hotkeyIcon = this.game.add.bitmapText(2, 16, 'font', `[${hotkeys_stat[i]}]`, 13);
				hotkeyIcon.anchor.setTo(0, 1);
				this.lbTextGroup.add(hotkeyIcon);
				actionbar.addChild(hotkeyIcon);
			} else {
				actionbar.scale.setTo(1.3);
				stat.scale.setTo(1.3);
				add.scale.setTo(1.3);
			}

			actionbar.alpha = 0.75;
			actionbar.anchor.setTo(0, 0.5);
			label.anchor.setTo(0, 0.5);
			stat.anchor.setTo(0.5);
			add.alpha = 0.75;
			add.anchor.setTo(0.5);
			add.scale.setTo(0);
			add.inputEnabled = true;
			add.events.onInputOver.add(this.buttonOver, this);
			add.events.onInputOut.add(this.buttonOut, this);
			add.name = stat_label[i].toLowerCase();
			add.tweenIn = this.game.add.tween(add.scale).to({x: 1, y: 1}, 1000, Phaser.Easing.Elastic.Out);
			add.tweenOut = this.game.add.tween(add.scale).to({x: 0, y: 0}, 500, Phaser.Easing.Elastic.Out);
			add.tweenIn.onStart.add(() => add.revive());
			add.tweenOut.onComplete.add(() => add.kill());
			add.events.onInputDown.add(this.addStat, this);
			add.kill();

			actionbar.stat = stat;
			actionbar.add = add;

			actionbar.addChild(label);
			actionbar.addChild(stat);
			actionbar.addChild(add);

			this.actionbarGroup_stat.add(actionbar);

			spaceY += actionbar.height + 2;
		}

		//Choose heropower UI
		this.choosetext = this.game.add.bitmapText(this.game.canvas.width/2, this.game.canvas.height - 250, 'font', 'Choose hero power:', 26);
		this.choosetext.anchor.setTo(0.5);

		this.opt1Button = this.game.add.sprite(-50, 50, 'atlas', 'icon_generic.png');
		this.opt1Text = this.game.add.bitmapText(0, 20, 'font', '', 20);
		this.opt2Button = this.game.add.sprite(50, 50, 'atlas', 'icon_generic.png');
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
		    this.lbHeader.x = this.game.canvas.width - 100;
		}, this);*/

		this.expBar.setFixedToCamera(true);
		this.expBar_bar.fixedToCamera = true;
		this.statTextGroup.fixedToCamera = true;
		this.lbTextGroup.fixedToCamera = true;
		this.actionbarGroup.fixedToCamera = true;
		this.actionbarGroup_stat.fixedToCamera = true;
		this.choosetext.fixedToCamera = true;

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
		this.lbText.forEach((item, i) => {
			item.text = '';
		});

		leaderboard.forEach((item, index) => {
			this.lbText[index].text = `${index + 1}. ${item.name}: ${item.score}`;
		});
	}

	updateText(type, text) {
		switch(type) {
			case 'level':
				this.levelText.text = 'Level: ' + this.stats.level;
			break;
			case 'points':
				this.pointsText.text = 'Points available: ' + this.stats.points;
			break;
			case 'firerate':
				if (this.stats.firerate >= this.maxStats) {
					this.actionbarGroup_stat.getAt(0).stat.scale.setTo(0.75);
					this.actionbarGroup_stat.getAt(0).stat.text = 'MAX';
				} else {
					this.actionbarGroup_stat.getAt(0).stat.text = this.stats.firerate;
				}
			break;
			case 'speed':
				if (this.stats.speed >= this.maxStats) {
					this.actionbarGroup_stat.getAt(1).stat.scale.setTo(0.75);
					this.actionbarGroup_stat.getAt(1).stat.text = 'MAX';
				} else {
					this.actionbarGroup_stat.getAt(1).stat.text = this.stats.speed;
				}
			break;
			case 'damage':
				if (this.stats.damage >= this.maxStats) {
					this.actionbarGroup_stat.getAt(2).stat.scale.setTo(0.75);
					this.actionbarGroup_stat.getAt(2).stat.text = 'MAX';
				} else {
					this.actionbarGroup_stat.getAt(2).stat.text = this.stats.damage;
				}
			break;
			case 'health':
				if (this.stats.health >= this.maxStats) {
					this.actionbarGroup_stat.getAt(3).stat.scale.setTo(0.75);
					this.actionbarGroup_stat.getAt(3).stat.text = 'MAX';
				} else {
					this.actionbarGroup_stat.getAt(3).stat.text = this.stats.health;
				}
			break;
		}

		this.checkPoints();
	}

	newPowerAvailable(index) {
		console.log(index);
		if (index >= 0 && index <= 3) { 
			let actionbar = this.actionbarGroup.getAt(index);
			actionbar.show.start();
			actionbar.events.onInputDown.add(this.showPowerOption, {text: this.getPowerTexts(index), _this: this});

			if (!this.game.onMobile) {
				let key = this.hotkeyList[index];
				key.onDown.add(this.showPowerOption, {text: this.getPowerTexts(index), _this: this});
			}
		}
	}

	showPowerOption() {
		let _this = this._this;
		let text = this.text;

		_this.opt1Text.text = text.opt1Text;
		_this.opt2Text.text = text.opt2Text;
		_this.opt1Button.loadTexture('atlas', text.btn1Texture);
		_this.opt2Button.loadTexture('atlas', text.btn2Texture);
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
				texts.btn1Texture = 'icon_shield.png';
				texts.btn2Texture = 'icon_heal.png';
			break;
			case 1:
				texts.opt1Text = 'Seeker';
				texts.opt2Text = 'Multishot';
				texts.btn1Texture = 'icon_seeker.png';
				texts.btn2Texture = 'icon_multishot.png';
			break;
			case 2:
				texts.opt1Text = 'Magnet';
				texts.opt2Text = 'Warpspeed';
				texts.btn1Texture = 'icon_magnet.png';
				texts.btn2Texture = 'icon_warpspeed.png';
			break;
			case 3:
				texts.opt1Text = 'Trap';
				texts.opt2Text = 'Shockwave';
				texts.btn1Texture = 'icon_trap.png';
				texts.btn2Texture = 'icon_shockwave.png';
			break;
		}

		return texts;
	}

	sendPowerUpgrade(button) {
		this.hideHeroBtns.start();

		let actionbar = this.actionbarGroup.getAt(button.actionbarIndex);

		if (actionbar) {
			actionbar.chosenPower.loadTexture('atlas', button._frame.name);
			actionbar.newPowerIcon.kill();
			actionbar.events.onInputDown.removeAll();
			actionbar.events.onInputDown.add(this.activateHeroPower, {actionbar: actionbar, game: this.game});
			if (!this.game.onMobile) {
				let key = this.hotkeyList[button.actionbarIndex];
				key.onDown.removeAll();
				key.onDown.add(this.activateHeroPower, {actionbar: actionbar, game: this.game});
			}

			this.game.room.send({powerChosen: {option: button.opt, index: actionbar.powerNumber}});
		}
	}

	activateHeroPower() {
		if (this.actionbar) {
			if (this.actionbar.cooldown < Date.now()) {
				this.actionbar.cooldownTween.start();
				this.game.room.send({activatePower: this.actionbar.powerNumber});
				this.actionbar.cooldown = Date.now() + 30000;
			}
		}
	}

	addPoints() {
		this.stats.points++;
		this.updateText('points', this.stats.points);
	}

	checkPoints() {
		this.actionbarGroup_stat.forEach(item => {
			if (this.stats.points > 0) {
				if (item.stat.text == 'MAX') {
					item.add.tweenOut.start();
				} else if (item.stat.text <= this.maxStats) {
					item.add.tweenIn.start();
				}
			} else {
				item.add.tweenOut.start();
			}
		});
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