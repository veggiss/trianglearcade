import HealthBar from './HealthBar';
//import Player from './Player';

class UI {
	constructor(game, stats) {
		this.game = game;
		this.stats = stats;

		this.statTextGroup = this.game.add.group();
		this.lbTextGroup = this.game.add.group();
		this.statButtonGroup = this.game.add.group();

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

		/*this.game.scale.setResizeCallback(() => { //--- This event has to be removed before changing state
		    this.lbHeader.x = window.innerWidth - 100;
		}, this);*/

		this.expBar.barSprite.fixedToCamera = true;
		this.expBar.bgSprite.fixedToCamera = true;
		this.statTextGroup.fixedToCamera = true;
		this.lbTextGroup.fixedToCamera = true;
		this.statButtonGroup.fixedToCamera = true;

		this.game.add.existing(this.statTextGroup);

		return this;
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
	}

	textOut(button, mouse) {
		button.alpha = 0.5;
	}
}

export default UI;