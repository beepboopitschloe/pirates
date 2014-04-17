function Island(minX, minY, maxX, maxY) {
	this.minX = minX;
	this.minY = minY;
	this.maxX = maxX;
	this.maxY = maxY;

	this.grassTiles = [];
	this.sandTiles = [];

	this.name = 'Ye Lonesome Isle';
}

Island.prototype.name = function(strIn) {
	if (strIn)
		this.name = strIn;
	else
		return this.name;	
}

Island.prototype.grassTiles = function(arrIn) {
	if (arrIn)
		this.grassTiles = arrIn;
	else
		return this.grassTiles;
}

Island.prototype.sandTiles = function(arrIn) {
	if (arrIn)
		this.sandTiles = arrIn;
	else
		return this.sandTiles;
}

World = {
	worldMap: [],
	worldWidth: 10,
	worldHeight: 10,

	chunkWidth: 24,
	chunkHeight: 24,

	numIslands: 0,
	islandToOceanRatio: .1,
	islands: [],

	init: function() {
		for (var x=0; x<this.worldWidth; x++) {
			this.worldMap[x] = new Array(this.worldHeight);
			for (var y=0; y<this.worldHeight; y++) {
				this.worldMap[x][y] = null;
			}
		}

		this.numIslands = Math.floor((this.worldWidth * this.worldHeight) * this.islandToOceanRatio); // 1-5 islands
		console.log('Generating', this.numIslands, 'islands');

		this.generate();
	},

	buildMapModal: function() {
		var map = $('#world-map-div');
		map.empty();

		var playerChunkX = Math.floor(Game.player.x/Game.map_grid.tile.width/this.chunkWidth);
		var playerChunkY = Math.floor(Game.player.y/Game.map_grid.tile.height/this.chunkHeight);

		console.log("player in chunk", playerChunkX, playerChunkY);

		for (var x=0; x<this.worldWidth; x++) {
			for (var y=0; y<this.worldHeight; y++) {
				var innerHtml = '';

				if (x == playerChunkX && y == playerChunkY) {
					innerHtml = '<img src="img/playerMapTile.png"</img>';
				} else if (this.worldMap[x][y]) {
					innerHtml = '<img src="img/islandTile.png"</img>';
				} else {
					innerHtml = '<img src="img/oceanTile.png"</img>';
				}
				map.append('<div class="map-cell">' + innerHtml + '</div>');
			}
			map.append('<br style="clear: left;" />');
		}
	},

	showMapModal: function() {
		this.buildMapModal();
		$('#world-map-modal').modal('show');
	},

	generateIsland: function(chunkX, chunkY) {
		var offX = chunkX * this.chunkWidth;
		var offY = chunkY * this.chunkHeight;

		var grassTiles = [];
		var sandTiles = [];
		var shallowWaterTiles = [];

		var spirals = Math.floor(Math.random() * 3) + 1; // 1-4 spirals

		var islandBaseWidth = Math.floor(Math.random() * this.chunkWidth/2);
		var islandBaseHeight = Math.floor(Math.random() * this.chunkHeight/2);
		var islandMaxWidth = islandBaseWidth + spirals;
		var islandMaxHeight = islandBaseHeight + spirals;

		var startX = Math.floor(Math.random() * (this.chunkWidth-(islandMaxWidth/2)) + (islandMaxWidth/2)) + offX;
		var endX = startX + islandBaseWidth;
		var startY = Math.floor(Math.random() * (this.chunkHeight-(islandMaxHeight/2)) + islandMaxHeight/2) + offY;
		var endY = startY + islandBaseHeight;

		var island = new Island(startX, startX + islandMaxWidth, startY, startY + islandMaxHeight);

		console.log('starts', startX, startY);

		for (var x=startX; x<endX; x++) {
			for (var y=startY; y<endY; y++) {
				var tile = Crafty.e('Grass').at(x, y);
				Game.addObject(tile);
				grassTiles.push(tile);
			}
		}

		// Now travel outwards in a circle
		var counter = 0;
		var landChanceBonusPerSurroundingTile = 1/8;
		var landThreshold = .65;

		for (var counter = 0; counter < spirals; counter++) {
			startX--;
			startY--;

			var landChance = 0;
			landChanceBonusPerSurroundingTile *= .95;

			for (var x = startX; x < endX; x++) {
				landChance = Math.random()-Math.random();
				Game.forEachNeighbor(x, startY, function(neighbor) {
					if (neighbor !== 'null' && neighbor.has('Grass'))
						landChance += landChanceBonusPerSurroundingTile;
				});

				if (landChance > landThreshold) {
					var tile = Crafty.e('Grass').at(x, startY);
					Game.addObject(tile);
					grassTiles.push(tile);
				}
			}

			for (var y = startY; y < endY; y++) {
				landChance = Math.random();
				Game.forEachNeighbor(endX, y, function(neighbor) {
					if (neighbor !== 'null' && neighbor.has('Grass'))
						landChance += landChanceBonusPerSurroundingTile;
				});

				if (landChance > landThreshold) {
					var tile = Crafty.e('Grass').at(endX,y);
					Game.addObject(tile);
					grassTiles.push(tile);
				}
			}

			for (var x = endX; x > startX; x--) {
				landChance = Math.random();
				Game.forEachNeighbor(x, endY, function(neighbor) {
					if (neighbor !== 'null' && neighbor.has('Grass'))
						landChance += landChanceBonusPerSurroundingTile;
				});

				if (landChance > landThreshold) {
					var tile = Crafty.e('Grass').at(x,endY);
					Game.addObject(tile);
					grassTiles.push(tile);
				}
			}

			for (var y = endY; y > startY; y--) {
				landChance = Math.random();
				Game.forEachNeighbor(startX, y, function(neighbor) {
					if (neighbor !== 'null' && neighbor.has('Grass'))
						landChance += landChanceBonusPerSurroundingTile;
				});

				if (landChance > landThreshold) {
					var tile = Crafty.e('Grass').at(startX,y);
					Game.addObject(tile);
					grassTiles.push(tile);
				}
			}

			endX++;
			endY++;
		}

		// mark all land tiles touching water to be sand
		for (var i = 0; i < grassTiles.length; i++) {
			var touchingWater = false;

			var quads = {
				upLeft: 'Grass',
				upRight: 'Grass',
				downLeft: 'Grass',
				downRight: 'Grass'
			};

			Game.forEachNeighbor(grassTiles[i].at().x, grassTiles[i].at().y, function(neighbor, key, index) {
				if (neighbor === 'null') {

					switch (key) {
						case 'upLeft':
							quads.upLeft = 'Sand';
							break;
						case 'up':
							quads.upLeft = 'Sand';
							quads.upRight = 'Sand';
							break;
						case 'upRight':
							quads.upRight = 'Sand';
							break;
						case 'left':
							quads.upLeft = 'Sand';
							quads.downLeft = 'Sand';
							break;
						case 'right':
							quads.upRight = 'Sand';
							quads.downRight = 'Sand';
							break;
						case 'downLeft':
							quads.downLeft = 'Sand';
							break;
						case 'down':
							quads.downLeft = 'Sand';
							quads.downRight = 'Sand';
							break;
						case 'downRight':
							quads.downRight = 'Sand';
							break;
					}
				}
			}, true);

			Game.addObject(Crafty.e('MapQuad')
					.at(grassTiles[i].at().x, grassTiles[i].at().y)
					.setQuadrants(quads));

			grassTiles[i].destroy();
		}

		// now stuff all this data into an island and add it to the map
		this.worldMap[chunkX][chunkY] = island;
		this.islands.push(island);
	},

	generatePort: function() {

	},

	generate: function() {
		this.occupied = new Array(Game.map_grid.width);
		Game.mapObjects = new Array(Game.map_grid.width);
		for (var i=0; i<Game.map_grid.width; i++) {
			this.occupied[i] = new Array(Game.map_grid.height);
			Game.mapObjects[i] = new Array(Game.map_grid.height);
			for (var k=0; k<Game.map_grid.height; k++) {
				this.occupied[i][k] = false;
				Game.mapObjects[i][k] = [];
			}
		}

		this.generateIsland(0, 0);

		for (var i=0; i<this.numIslands-1; i++) {
			do {
				x = Math.floor(Math.random() * this.worldWidth);
				y = Math.floor(Math.random() * this.worldHeight);
			} while (this.worldMap[x][y]);

			this.generateIsland(x,y);
		}

		console.log(this.worldMap);
	}
}