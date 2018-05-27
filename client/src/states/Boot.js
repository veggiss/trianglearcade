class Boot extends Phaser.State {
	preload() {
		console.log("%cVersion: alpha", "color:black; background:yellow");
	}

	create() {
		let width = window.innerWidth;
		let height = window.innerHeight;

		if (window.innerWidth < 1280 || window.innerHeight < 720 ) {
			width = window.innerWidth * 2;
			height = window.innerHeight * 2;
		}

		this.game.scale.setGameSize(width, height);
		this.game.scale.scaleMode = !this.game.device.desktop ? Phaser.ScaleManager.RESIZE : Phaser.ScaleManager.SHOW_ALL;
		this.game.canvas.oncontextmenu = function (e) { e.preventDefault(); }
		this.game.state.start("Preload");
	}

}

export default Boot;
