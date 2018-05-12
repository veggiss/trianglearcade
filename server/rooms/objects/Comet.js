const util = require('./../utility/util');

module.exports = class Comet {
    constructor() {
        this.x = -300;
		this.y = util.ranNumBetween(100, 1820);

        this.private = util.setEnumerable({
	        dest: {
	        	x: 2020,
	        	y: util.ranNumBetween(100, 1820)
	        },
	        health: 400
        });
    }

    update() {
    	let angle = Math.atan2(this.private.dest.y - this.y, this.private.dest.x - this.x);
		this.x += Math.sin(angle) * 2;
		this.y -= Math.cos(angle) * 2;
    }
}