class Boot extends Phaser.State {
	preload() {
		console.log("%cVersion: alpha", "color:black; background:yellow");
	}

	create() {
		let width = window.innerWidth;
		let height = window.innerHeight;

		this.game.scale.scaleMode = this.game.device.desktop ? Phaser.ScaleManager.RESIZE : Phaser.ScaleManager.SHOW_ALL;

		if (this.game.device.desktop) {
			console.log(width);
			if (width < 1000) {
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

		console.log(this.game.canvas);

		this.game.canvas.oncontextmenu = function (e) { e.preventDefault(); }
		this.game.state.start("Preload");
	}

}

export default Boot;
