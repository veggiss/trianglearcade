class Particles {
	constructor(game, tint) {
		this.game = game;
		this.tint = tint;
		this.playerMoveGroup = this.game.add.group();
		this.playerMoveGroup.z = 1;
		this.playerMoveTime = Date.now();
		this.playerMoveDelay = 300;

		this.bulletTrailGroup = this.game.add.group();
		this.bulletTrailGroup.z = 1;
		this.bulletTrailTime = Date.now();
		this.bulletTrailDelay = 100;

		// Moving player particles
		for (let i = 0; i < 5; i++) {
			let particle = this.game.add.sprite(0, 0, 'deathParticle');
			particle.tween = this.game.add.tween(particle.scale).to({x: 0, y: 0}, 1000, Phaser.Easing.Linear.None, false);
			particle.tween.onComplete.add(() => {
				particle.kill();
			});
			particle.scale.setTo(5);
			particle.anchor.setTo(0.5);
			particle.kill();
			this.playerMoveGroup.add(particle);
		}

		// Bulle trail particles
		for (let i = 0; i < 15; i++) {
			let particle = this.game.add.sprite(0, 0, 'bullet');
			particle.tween = this.game.add.tween(particle.scale).to({x: 0, y: 0}, 400, Phaser.Easing.Linear.None, false);
			particle.tween.onComplete.add(() => {
				particle.kill();
			});
			particle.scale.setTo(1);
			particle.anchor.setTo(0.5);
			particle.kill();
			this.bulletTrailGroup.add(particle);
		}

		//Bullet hit emitter
		this.bulletHit = this.game.add.emitter(0, 0, 12);
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
		}
	}

	bulletTrail(x, y) {
		let particle = this.bulletTrailGroup.getFirstDead();

		if (particle) {
			particle.tint = this.tint;
			particle.scale.setTo(1);
			particle.reset(x, y);
			particle.tween.start();
		}
	}

	emitHit(x, y) {
		this.bulletHit.x = x;
		this.bulletHit.y = y;
		this.bulletHit.start(true, 500, null, 3);
	}
}

export default Particles;