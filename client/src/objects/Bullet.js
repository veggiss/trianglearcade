class Bullet extends Phaser.Sprite {
	constructor(game, x, y, angle, owner, index) {
		super(game, x, y, 'bullet');
		
		this.game = game;
		this.owner = owner;
		this.index = index;
		this.timer = Date.now() + 1000;
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
}

export default Bullet;