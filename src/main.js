Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

Helper = {
	randomSeed: function() {
		return Math.random().toString(36).slice(2);
	}
}

Game = {
	map_grid: {
		width: World.settings.worldWidth * World.settings.chunkWidth,
		height: World.settings.worldHeight * World.settings.chunkHeight,
		tile: {
			width: 32,
			height: 32,
			margin: 0
		}
	},

	worldSeed: "Test",

	player: null,
	enemies: [],
	maxEnemies: 50,

	width: function() {
		return this.map_grid.tile.margin + (this.map_grid.width * (this.map_grid.tile.width
					+ this.map_grid.tile.margin));
	},

	height: function() {
		return this.map_grid.tile.margin + (this.map_grid.height * (this.map_grid.tile.height
					+ this.map_grid.tile.margin));
	},

	viewportWidth: function() {
		return 640;
	},

	viewportHeight: function() {
		return 480;
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

	withinBounds: function(x, y) {
		return (x > 0 && y > 0 && x < this.map_grid.width && y < this.map_grid.width);
	},

	neighbors: function(x, y, includeDiagonals) {
		var neighbors = { };

		try {
			neighbors.up = this.withinBounds(x, y-1)? this.mapObjects[x][y-1] : [];
			neighbors.left = this.withinBounds(x-1, y)? this.mapObjects[x-1][y] : [];
			neighbors.right = this.withinBounds(x+1, y)? this.mapObjects[x+1][y] : [];
			neighbors.down = this.withinBounds(x, y+1)? this.mapObjects[x][y+1] : [];

			if (includeDiagonals) {
				neighbors.upLeft = this.withinBounds(x-1, y-1)? this.mapObjects[x-1][y-1] : [];
				neighbors.upRight = this.withinBounds(x+1, y-1)? this.mapObjects[x+1][y-1] : [];
				neighbors.downLeft = this.withinBounds(x-1, y+1)? this.mapObjects[x-1][y+1] : [];
				neighbors.downRight = this.withinBounds(x+1, y+1)? this.mapObjects[x+1][y+1] : [];
			}
		} catch(e) {
			console.log(e, x, y, includeDiagonals);
		}

		return neighbors;
	},

	forEachNeighbor: function(x, y, func, includeDiagonals) {
		var neighbors = this.neighbors(x, y, includeDiagonals);

		for (key in neighbors) {
			if (!neighbors[key]) {
				try {
					throw new TypeError("Cannot find key " + key + " in " + JSON.stringify(neighbors));
				} catch(e) {
					console.log(e, x, y);
				}
				continue;
			} else if (neighbors[key].length == 0) {	
				func('null', key, 0);
				continue;
			}

			for (var i = 0; i<neighbors[key].length; i++) {
				// console.log(neighbors[key][i]);
				func(neighbors[key][i], key, i);
			}
		}
	},

	addObject: function(object, x, y) {
		if (object.has('Grid')) {
			this.mapObjects[object.at().x][object.at().y].push(object);
		} else if (x >= 0 && y >= 0 && x < map_grid.width && y < map_grid.height) {
			this.mapObjects[x][y].push(object);
		}
	},

	removeObject: function(object, x, y) {
		if (object.has('Grid')) {
			this.mapObjects[object.at().x][object.at().y].remove(object);
		} else if (x >= 0 && y >= 0 && x < map_grid.width && y < map_grid.height) {
			this.mapObjects[x][y].remove(object);
		}
	},

	validMove: function(x, y) {
		if (x < 0 || y < 0 || x >= this.map_grid.width || y >= this.map_grid.height) {
			return false;
		}

		var objArray = this.mapObjects[x][y];

		var solid = false; var port = false;

		for (var i=0; i<objArray.length; i++) {
			if (objArray[i].has('Solid'))
				solid = true;
			if (objArray[i].has('Port'))
				port = true;
		}

		return (!solid || port);
	},

	start: function() {
		// clear the saved world (for testing purposes)
		World.unsave();

		// start Crafty
		Crafty.init(Game.width(), Game.height(), "cr-stage");
		// Crafty.timer.FPS(32);
    	Crafty.background('rgb(125, 123, 249)');
    	//Crafty.viewport.scale(3);
    	Crafty.viewport.width = this.viewportWidth();
    	Crafty.viewport.height = this.viewportHeight();

	   	this.duelStage = {
			x: this.viewportWidth()/8,
			y: (this.viewportHeight()/3)*2,
			w: (this.viewportWidth()/4)*3,
			h: this.viewportHeight()/3
		};

    	// set up notification feed
    	gui.init();

		Crafty.scene('Loading');
	}
}

text_css = {
	'font-size': '24px',
	'font-family': 'Arial',
	'color': 'white'
};

window.onload = function() {
	Game.start();

	$("#map-btn").on('click', function(e) {
		World.toggleMapModal();
	});
}