class Bullet extends Phaser.Sprite {
	constructor(game, x, y) {
		super(game, x, y, 'bullet');

		this.owner;
		this.id;
		this.angle;
		this.speed = 0;
		this.game = game;
		this.timer = Date.now();
		this.anchor.setTo(0.5, 0.5);
		this.kill();

		//Emitter
		this.bulletTrailer = this.game.add.emitter(0, 0, 40);
		this.bulletTrailer.makeParticles('deathParticle');
		this.bulletTrailer.setAlpha(1, 0, 600);
		this.bulletTrailer.setXSpeed(0, 0);
		this.bulletTrailer.setYSpeed(0, 0);
		this.bulletTrailer.setScale(0, 0.5, 0, 0.5, 400);
		this.bulletTrailer.frequency = 10;
		this.bulletTrailer.lifespan = 400;
		this.bulletTrailer.gravity = 0;
		this.game.add.existing(this);
	}

	update() {
		if (this.alive && this.dest) {
			this.bulletTrailer.on = true;
	        this.x = this.lerp(this.x, this.dest.x, 0.03);
	        this.y = this.lerp(this.y, this.dest.y, 0.03);
	        this.bulletTrailer.x = this.x;
	        this.bulletTrailer.y = this.y;

	        if (Date.now() > this.timer) {
	        	this.bulletTrailer.on = false;
	        	this.kill();
	        }
        }
	}

	setTint(tint) {
		this.bulletTrailer.setAllChildren('tint', tint);
	}

	setDest(x, y) {
        this.dest = {
            x: x + Math.sin((this.angle) / 180.0 * Math.PI) * 750,
            y: y - Math.cos((this.angle) / 180.0 * Math.PI) * 750
        }
	}

	lerp(a, b, n) {
	    return (1 - n) * a + n * b;
	}
}

export default Bullet;