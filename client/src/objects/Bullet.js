class Bullet extends Phaser.Sprite {
	constructor(game, x, y) {
		super(game, x, y, 'bullet');

		this.id;
		this.game = game;
		this.timer = Date.now();
		this.trailTimer = Date.now();
		this.anchor.setTo(0.5, 0.5);
		this.z = 1;
		this.particles;
		this.kill();
	}

	update() {
		if (this.alive && this.dest) {
	        this.x = this.lerp(this.x, this.dest.x, 0.02);
	        this.y = this.lerp(this.y, this.dest.y, 0.02);

	        if (this.particles && this.trailTimer < Date.now()) {
	        	this.particles.bulletTrail(this.x, this.y);
	        	this.trailTimer = Date.now() + 50;
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