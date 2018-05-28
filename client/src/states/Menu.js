class Menu extends Phaser.State {
	create() {
		this.game.stage.backgroundColor = '#021421';
		this.game.stage.disableVisibilityChange = true;
		this.game.world.setBounds(0, 0, this.game.width, this.game.heigth);
		
		//Background
		this.starfield = this.add.tileSprite(0, 0, this.game.canvas.width, this.game.canvas.height, 'starfield');
		this.starfield.fixedToCamera = true;
		this.starfield.alpha = 0.5;

		this.text = this.game.add.bitmapText(0, 0, 'font', 'Who are you?', 22);
		this.text.anchor.setTo(0.5, 0.5);
		this.uiDiv = document.createElement("DIV");
		this.input = document.createElement("INPUT");
		this.button = document.createElement("BUTTON");
		this.input.setAttribute("type", "text");
		this.button.innerHTML = 'Enter';
		this.gameDiv = document.getElementById("content");
		this.setUiPos();
		/*this.game.scale.setResizeCallback(() => {
		    this.scale.refresh();
		    console.log("lol");
		}, this);*/
		this.uiDiv.appendChild(this.input);
		this.uiDiv.appendChild(this.button);
		this.gameDiv.appendChild(this.uiDiv);

		this.button.addEventListener('click', () => {
			this.game.myName = this.input.value == '' ? 'guest' : this.input.value;
			this.uiDiv.remove();
			this.game.state.start("Main");
		}, false);
	}

	setUiPos() {
		this.text.x = this.game.canvas.width/2;
		this.text.y = 100;
		this.input.setAttribute("style", "position:absolute;width:"+ 128 +"px;left:"+(this.text.x - (this.text.width/2) - 5)+"px;top:"+(this.text.y + 25)+"px;");
		this.button.setAttribute("style", "position:absolute;width:"+ 132 +"px;left:"+(this.text.x - (this.text.width/2) - 5)+"px;top:"+(this.text.y + 55)+"px;");
	}

}

export default Menu;