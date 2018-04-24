class Boot extends Phaser.State {
	preload() {
		console.log("%cVersion: alpha", "color:black; background:yellow");
	}

	create() {
		//PIXI.scaleModes.DEFAULT = PIXI.scaleModes.NEAREST;
		//Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);
		//Phaser.Canvas.setSmoothingEnabled(this.game.canvas, false);
		//this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
		this.game.canvas.oncontextmenu = function (e) { e.preventDefault(); }
		this.game.state.start("Preload");
	}

}

export default Boot;
