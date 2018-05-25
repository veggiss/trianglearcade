class Boot extends Phaser.State {
	preload() {
		console.log("%cVersion: alpha", "color:black; background:yellow");
	}

	create() {
        this.game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
        this.game.scale.pageAlignVertically = false;
        this.game.scale.pageAlignHorizontally = false;
		this.game.canvas.oncontextmenu = function (e) { e.preventDefault(); }
		this.game.state.start("Preload");
	}

}

export default Boot;
