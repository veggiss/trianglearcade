class Boot extends Phaser.State {
	preload() {
		console.log("%cVersion: alpha", "color:black; background:yellow");
	}

	create() {
		let width = window.innerWidth;
		let height = window.innerHeight;

		if (!this.game.device.desktop) {
			width = window.innerWidth * 1.5;
			height = window.innerHeight * 1.5;
		}

		this.game.scale.setGameSize(width, height);
		this.game.scale.scaleMode = this.game.device.desktop ? Phaser.ScaleManager.RESIZE : Phaser.ScaleManager.SHOW_ALL;
		this.game.canvas.oncontextmenu = function (e) { e.preventDefault(); }
		this.game.state.start("Preload");
	}

}

export default Boot;
