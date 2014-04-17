World = {
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

		var grassTiles = [];
		var sandTiles = [];
		var shallowWaterTiles = [];

		// mark the middle third of the map as land
		var startX = Math.floor(Game.map_grid.width/3);
		var endX = startX*2;
		var startY = Math.floor(Game.map_grid.height/3);
		var endY = startY*2;

		for (var x=startX; x<endX; x++) {
			for (var y=startY; y<endY; y++) {
				var tile = Crafty.e('Grass').at(x, y);
				Game.addObject(tile);
				grassTiles.push(tile);
			}
		}

		// Now travel outwards in a circle
		var spirals = 3;
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
	}

}