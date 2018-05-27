class Seeker extends Phaser.Sprite {
	constructor(game, x, y) {
		super(game, x, y, 'bullet');

		this.id;
		this.target;
		this.game = game;
		this.timer = Date.now();
		this.trailTimer = Date.now();
		this.anchor.setTo(0.5, 0.5);
		this.scale.setTo(2);
		this.particles;
		this.kill();
	}

	update() {
		if (this.alive && this.target) {
	        if (this.target.alive) {
	            let dx = this.target.x - this.x;
	            let dy = this.target.y - this.y;
	            this.rotation = Math.atan2(dy, dx);
	        }

	        this.x += (Math.cos(this.rotation) * 16) / 3;
	        this.y += (Math.sin(this.rotation) * 16) / 3;

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

	setTrail(particles) {
		this.particles = particles;
	}

	lerp(a, b, n) {
	    return (1 - n) * a + n * b;
	}
}

export default Seeker;