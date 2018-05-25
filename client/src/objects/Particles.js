class Particles {
	constructor(game, tint) {
		this.tint = tint;
		this.playerMoveGroup = game.add.group();
		this.playerMoveTime = Date.now();
		this.playerMoveDelay = 300;

		this.bulletTrailGroup = game.add.group();
		this.bulletTrailTime = Date.now();
		this.bulletTrailDelay = 25;

		// Moving player particles
		for (let i = 0; i < 5; i++) {
			let particle = game.add.sprite(0, 0, 'deathParticle');
			particle.tween = game.add.tween(particle.scale).to({x: 0, y: 0}, 1000, Phaser.Easing.Linear.None, false);
			particle.scale.setTo(5);
			particle.anchor.setTo(0.5);
			particle.kill();
			this.playerMoveGroup.add(particle);
		}

		// Moving player particles
		for (let i = 0; i < 5; i++) {
			let particle = game.add.sprite(0, 0, 'bullet');
			particle.tween = game.add.tween(particle.scale).to({x: 0, y: 0}, 200, Phaser.Easing.Linear.None, false);
			particle.scale.setTo(1);
			particle.anchor.setTo(0.5);
			particle.kill();
			this.bulletTrailGroup.add(particle);
		}

		//Bullet hit emitter
		this.bulletHit = game.add.emitter(0, 0, 12);
		this.bulletHit.makeParticles('deathParticle');
		this.bulletHit.setAlpha(1, 0, 500);
		this.bulletHit.setScale(1, 0, 1, 0, 500);
		this.bulletHit.lifespan = 500;
		this.bulletHit.gravity = 0;
		this.bulletHit.setAllChildren('tint', this.tint);
	}


	playerMove(x, y) {
		let particle = this.playerMoveGroup.getFirstDead();

		if (particle && this.playerMoveTime < Date.now()) {
			particle.tint = this.tint;
			particle.scale.setTo(1);
			particle.reset(x, y);
			particle.tween.start();
			this.playerMoveTime = Date.now() + this.playerMoveDelay;
			particle.tween.onComplete.add(() => {
				particle.kill();
			});
		}
	}

	bulletTrail(x, y) {
		let particle = this.bulletTrailGroup.getFirstDead();

		if (particle && this.bulletTrailTime < Date.now()) {
			particle.tint = this.tint;
			particle.scale.setTo(1);
			particle.reset(x, y);
			particle.tween.start();
			this.bulletTrailTime = Date.now() + this.bulletTrailDelay;
			particle.tween.onComplete.add(() => {
				particle.kill();
			});
		}
	}

	emitHit(x, y) {
		this.bulletHit.x = x;
		this.bulletHit.y = y;
		this.bulletHit.start(true, 500, null, 3);
	}
}

export default Particles;