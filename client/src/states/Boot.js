class Boot extends Phaser.State {
	preload() {
		console.log("%cVersion: alpha", "color:black; background:yellow");
	}

	create() {
		let width = window.innerWidth * 2;
		let height = window.innerHeight * 2;

		/*if (!this.game.device.desktop) {
			width = width * 2;
			height = height * 2;
		}*/

		this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.game.width = width;
		this.game.height = height;
		this.game.renderer.resize(width, height);
		//this.game.renderer.projection.x = width/4;
		//this.game.renderer.projection.y = height/4;
		this.game.camera.setSize(width, height);
		﻿﻿﻿//this.game.scale.setShowAll();
		//this.game.input.scale.setTo(2);
		console.log(this.game.renderer);

		//this.game.scale.setGameSize(width, height);
		/*this.game.scale.scaleMode = this.game.device.desktop ? Phaser.ScaleManager.RESIZE : Phaser.ScaleManager.SHOW_ALL;
		this.game.scale.width = 12000;*/
		this.game.scale.refresh();
		this.game.canvas.oncontextmenu = function (e) { e.preventDefault(); }
		this.game.state.start("Preload");
	}

}

export default Boot;
