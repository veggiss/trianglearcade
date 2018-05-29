class Powers {
	constructor(game, player) {
		this.game = game;
		this.player = player;
		this.powersGroup = this.game.add.group();
		this.active = [];

		//Power assets
		this.powerShield = this.game.add.sprite(0, 0, 'atlas', 'power_shield.png');
		this.powerShield.tweenIn = this.game.add.tween(this.powerShield.scale).to({x: 1, y: 1}, 500, Phaser.Easing.Elastic.Out);
		this.powerShield.tweenOut = this.game.add.tween(this.powerShield).to({alpha: 0}, 500, Phaser.Easing.Linear.none);
		this.powerShield.tweenIn.onStart.add(() => {this.powerShield.revive(); this.powerShield.alpha = 1;});
		this.powerShield.tweenOut.onComplete.add(() => {this.powerShield.kill(); this.powerShield.scale.setTo(0)});

		this.powerMagnet = this.game.add.sprite(0, 0, 'atlas', 'power_magnet.png');
		this.powerMagnet.tweenIn = this.game.add.tween(this.powerMagnet.scale).to({x: 1, y: 1}, 500, Phaser.Easing.Elastic.Out);
		this.powerMagnet.tweenOut = this.game.add.tween(this.powerMagnet).to({alpha: 0}, 500, Phaser.Easing.Linear.none);
		this.powerMagnet.tweenIn.onStart.add(() => {this.powerMagnet.revive(); this.powerMagnet.alpha = 1;});
		this.powerMagnet.tweenOut.onComplete.add(() => {this.powerMagnet.kill(); this.powerMagnet.scale.setTo(0)});
		this.game.add.tween(this.powerMagnet).to({angle: 359}, 1000, null, true, 0, Infinity);

		this.powersGroup.add(this.powerShield);
		this.powersGroup.add(this.powerMagnet);

		this.powersGroup.forEach(power => {
			power.tint = player.tint;
			power.anchor.setTo(0.5);
			power.scale.setTo(0.5);
			power.kill();
		});

		this.player.addChild(this.powersGroup);
	}

	update(list) {
		list.forEach(power => {
			if (!this.active.includes(power)) {
				switch(power) {
					case 'shield':
						this.powerShield.tweenIn.start();
						setTimeout(() => {
							this.powerShield.tweenOut.start();
							let index = this.active.findIndex(item => {
								return item === 'shield';
							});
							if (index > -1) this.active.splice(index, 1);
						}, 6000);
					break;
					case 'magnet':
						this.powerMagnet.tweenIn.start();
						setTimeout(() => {
							this.powerMagnet.tweenOut.start();
							let index = this.active.findIndex(item => {
								return item === 'magnet';
							});
							if (index > -1) this.active.splice(index, 1);
						}, 10000);
					break;
				}


				this.active.push(power);
			}
		});
	}
}

export default Powers;