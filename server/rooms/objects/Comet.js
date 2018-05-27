const util = require('./../utility/util');

module.exports = class Comet {
    constructor(x, y) {
        this.x = x;
		this.y = y;

        this.private = util.setEnumerable({
	        health: 500
        });
    }

    bulletHit(damage) {
    	let dead = false;

    	this.private.health -= damage;

    	if (this.private.health <= 0) {
    		dead = true;
    	}

    	return dead;
    }
}