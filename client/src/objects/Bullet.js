class Bullet extends Phaser.Sprite {
	constructor(game, x, y) {
		super(game, x, y, 'bullet');

		this.owner;
		this.id;
		this.angle;
		this.speed = 0;
		this.game = game;
		this.timer = Date.now() + 1000;
		this.anchor.setTo(0.5, 0.5);
		this.kill();
		
		this.game.add.existing(this);
	}

	update() {
		if (this.alive) {
        this.x += (Math.sin(this.angle * Math.PI / 180) * (24 + this.speed)) / 3;
        this.y -= (Math.cos(this.angle * Math.PI / 180) * (24 + this.speed)) / 3;

	        if (Date.now() > this.timer) {
	        	this.kill();
	        }
        }
	}
}

export default Bullet;