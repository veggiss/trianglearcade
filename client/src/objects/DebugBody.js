class DebugBody extends Phaser.Sprite {
	constructor(game, x, y, type, data) {
		super(game, x, y, null);
		
		this.game = game;
		this.host = data.host;
		this.anchor.setTo(0.5, 0.5);

		let graphics = this.game.add.graphics(0, 0);

		if (type == 'circle') {
		    graphics.lineStyle(0);
		    graphics.beginFill(0x00FF00, 1);
		    graphics.drawCircle(0, 0, data.radius);
		    graphics.endFill();
		    this.addChild(graphics);
	    }

		this.game.add.existing(this);
	}

	update() {
		this.x = this.host.dest.x;
		this.y = this.host.dest.y;
	}
}

export default DebugBody;