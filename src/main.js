Game = {
	map_grid: {
		width: 24,
		height: 16,
		tile: {
			width: 16,
			height: 16,
			margin: 0
		}
	},

	width: function() {
		return this.map_grid.tile.margin + (this.map_grid.width * (this.map_grid.tile.width
					+ this.map_grid.tile.margin));
	},

	height: function() {
		return this.map_grid.tile.margin + (this.map_grid.height * (this.map_grid.tile.height
					+ this.map_grid.tile.margin));
	},

	findX: function(xIn) {
		var x = this.map_grid.tile.margin
				+ (xIn * (this.map_grid.tile.width + this.map_grid.tile.margin));
		return x;
	},

	findY: function(yIn) {
		var y = this.map_grid.tile.margin
				+ (yIn * (this.map_grid.tile.height + this.map_grid.tile.margin));
		return y;
	},

	toGrid: function(xIn, yIn) {
		var x = (xIn/(this.map_grid.tile.width + this.map_grid.tile.margin*2));
		var y = (yIn/(this.map_grid.tile.height + this.map_grid.tile.margin*2));

		return { x: x, y: y };
	},

	validMove: function(x, y) {
		var objArray = this.mapObjects[x][y];

		for (var i=0; i<objArray.length; i++) {
			if (objArray[i].has('Solid'))
				return false;
		}

		return true;
	},

	start: function() {
		// start Crafty
		Crafty.init(Game.width(), Game.height(), "cr-stage");
    	Crafty.background('rgb(125, 123, 249)');

		Crafty.scene('Game');
	}
}

window.onload = function() {
	Game.start();
}