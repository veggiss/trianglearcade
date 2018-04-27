class Bullet extends Phaser.Sprite {
	constructor(game, x, y, speed) {
		super(game, x, y, 'bullet');

		this.owner;
		this.id;
		this.angle;
		this.game = game;
		this.timer = Date.now() + 1000;
		this.anchor.setTo(0.5, 0.5);
		this.kill();
		
		this.game.add.existing(this);
	}

	update() {
		if (this.alive) {
        this.x += (Math.sin(this.angle * Math.PI / 180) * 16) / 3;
        this.y -= (Math.cos(this.angle * Math.PI / 180) * 16) / 3;

	        if (Date.now() > this.timer) {
	        	this.kill();
	        }
        }
	}
}

export default Bullet;