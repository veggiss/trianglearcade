class Boot extends Phaser.State {
	preload() {
		console.log("%cVersion: alpha", "color:black; background:yellow");
	}

	create() {
		let width = window.innerWidth;
		let height = window.innerHeight;

		this.game.scale.scaleMode = Phaser.ScaleManager.RESIZE;

		if (this.game.device.desktop) {
			if (width < 1000) {
				this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
				width = width * 2;
				height = height * 2;
				this.game.width = width;
				this.game.height = height;
				this.game.renderer.resize(width, height);
				this.game.camera.setSize(width, height);
				this.game.scale.refresh();
				this.game.changedScale = true;
			}
		}

		this.game.canvas.oncontextmenu = function (e) { e.preventDefault(); }
		this.game.state.start("Preload");
	}

}

export default Boot;
