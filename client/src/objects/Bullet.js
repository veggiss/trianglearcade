class Bullet extends Phaser.Sprite {
	constructor(game, x, y, angle, owner, index) {
		super(game, x, y, 'bullet');
		
		this.game = game;
		this.owner = owner;
		this.index = index;
		this.timer = Date.now() + 1000;

		//Emitter
	    this.emitter = this.game.add.emitter(0, 0, 100);
	    this.emitter.makeParticles('deathParticle');
	    this.emitter.gravity = 0;

		//Physics
		this.angle = angle;
		this.anchor.setTo(0.5, 0.5);
		this.game.add.existing(this);
	}

	update() {
        this.x += (Math.sin(this.angle * Math.PI / 180) * 16) / 3;
        this.y -= (Math.cos(this.angle * Math.PI / 180) * 16) / 3;

        if (Date.now() > this.timer) {
        	this.destroy();
        }
	}

	die() {
		this.emitter.x = this.x;
		this.emitter.y = this.y;
		this.emitter.start(true, 500, null, 5);
	}
}

export default Bullet;