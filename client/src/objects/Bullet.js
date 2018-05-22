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
		this.particles;
		this.kill();

		this.game.add.existing(this);
	}

	update() {
		if (this.alive && this.dest) {
	        this.x = this.lerp(this.x, this.dest.x, 0.03);
	        this.y = this.lerp(this.y, this.dest.y, 0.03);

	        if (this.particles) {
	        	this.particles.bulletTrail(this.x, this.y);
	        }

	        if (Date.now() > this.timer) {
	        	this.kill();
	        }
        }
	}

	setTint(tint) {
		this.tint = tint;
	}

	setDest(x, y) {
        this.dest = {
            x: x + Math.sin((this.angle) / 180.0 * Math.PI) * 750,
            y: y - Math.cos((this.angle) / 180.0 * Math.PI) * 750
        }
	}

	setTrail(particles) {
		this.particles = particles;
	}

	lerp(a, b, n) {
	    return (1 - n) * a + n * b;
	}
}

export default Bullet;