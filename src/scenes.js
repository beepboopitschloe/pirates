function generateMap() {
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
	var spirals = 4;
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

Crafty.scene('Game', function() {
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

	generateMap();

	this.player = Crafty.e('PlayerCharacter').at(0, 0);
	Crafty.viewport.follow(this.player, 10, 1000);
	// //console.log("PLACED AT: " + this.player.at().x + ", " + this.player.at().y);
	// //console.log("ACTUAL: " + this.player.x + ", " + this.player.y);
	// this.occupied[this.player.at().x][this.player.at().y] = true;
	
	// this.enemy = Crafty.e('Enemy').at(Game.map_grid.width-2, Game.map_grid.height-2);
	// this.occupied[this.enemy.at().x][this.enemy.at().y] = true;

	// for (var x=0; x<Game.map_grid.width; x++) {
	// 	for (var y=0; y<Game.map_grid.height; y++) {
	// 		var at_edge = x == 0 || x == Game.map_grid.width-1
	// 			|| y == 0 || y == Game.map_grid.height-1;

	// 		if (at_edge) {
	// 			Game.mapObjects[x][y].push(Crafty.e('Rock').at(x, y).toggleMargin());
	// 			this.occupied[x][y] = true;
	// 		} else if (!this.occupied[x][y] && Math.random() < 0.06) {
	// 			// Place a bush entity at the current tile
	// 			Game.mapObjects[x][y].push(Crafty.e('Island').at(x, y));
	// 			this.occupied[x][y] = true;
	// 		}
	// 	}
	// }

	// var maxPorts = 5;

	// while (Crafty('Port').length < maxPorts) {
	// 	var x = Math.floor(Math.random() * Game.map_grid.width);
	// 	var y = Math.floor(Math.random() * Game.map_grid.height);

	// 	if (this.occupied[x][y]) {
	// 		continue;
	// 	} else {
	// 		try {
	// 			Game.mapObjects[x][y].push(Crafty.e('Port').at(x, y));
	// 			this.occupied[x][y] = true;
	// 		} catch(err) {
	// 			console.log(x, y);
	// 		}
	// 	}
	// }

	this.showVictory = this.bind('PortVisited', function() {
		if (!Crafty('Port').length) {
			Crafty.scene('GameOver', true);
		} else {
			gui.notify({
				text: 'Visiting port. Only ' + Crafty('Port').length + ' left to go!'
			});
		}
	});
}, function() {
	this.unbind('PortVisited', this.showVictory);
});

Crafty.scene('GameOver', function(win) {
	var gameOverText;

	if (win) {
		gameOverText = 'Victory! Victory! Victory!'
				+ '<br /><br />'
				+ 'Press any key to play again.'
	} else {
		gameOverText = 'You lost.'
				+ '<br /><br />'
				+ 'Press any key to play again.'
	}

	Crafty.e('2D, DOM, Text')
		.attr({ x: 0, y: Game.height()/3, w: Game.width() })
		.text(gameOverText)
		.textFont({ size: '24px', family: 'Courier'})
		.textColor('#FFFFFF', 1.0)
		.css("text-align", "center");

	this.restartGame = this.bind('KeyDown', function() {
		Crafty.scene('Game');
		gui.notify({
			text: 'Game restarted.',
			type: 'success'
		});
	});
}, function() {
	this.unbind('KeyDown', this.restartGame);
});

Crafty.scene('Loading', function() {
	Crafty.e('2D, DOM, Text')
		.text('Loading')
		.attr({ x:0, y:Game.height()/2 - 24, w: Game.width() });

	Crafty.load('[img/environment.gif]', function() {
		Crafty.sprite(32, 'img/environment.gif', {
			spr_rock: [0, 0],
			spr_island: [1, 0],
			spr_port: [0, 1],
			spr_player: [1, 1]
		})

		Crafty.scene('Game');
	});
});