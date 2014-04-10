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

	this.player = Crafty.e('PlayerCharacter').at(10, 10);
	//console.log("PLACED AT: " + this.player.at().x + ", " + this.player.at().y);
	//console.log("ACTUAL: " + this.player.x + ", " + this.player.y);
	this.occupied[this.player.at().x][this.player.at().y] = true;
	
	this.enemy = Crafty.e('Enemy').at(Game.map_grid.width-2, Game.map_grid.height-2);
	this.occupied[this.enemy.at().x][this.enemy.at().y] = true;

	for (var x=0; x<Game.map_grid.width; x++) {
		for (var y=0; y<Game.map_grid.height; y++) {
			var at_edge = x == 0 || x == Game.map_grid.width-1
				|| y == 0 || y == Game.map_grid.height-1;

			if (at_edge) {
				Game.mapObjects[x][y].push(Crafty.e('Rock').at(x, y).toggleMargin());
				this.occupied[x][y] = true;
			} else if (!this.occupied[x][y] && Math.random() < 0.06) {
				// Place a bush entity at the current tile
				Game.mapObjects[x][y].push(Crafty.e('Island').at(x, y));
				this.occupied[x][y] = true;
			}
		}
	}

	var maxPorts = 5;

	while (Crafty('Port').length < maxPorts) {
		var x = Math.floor(Math.random() * Game.map_grid.width);
		var y = Math.floor(Math.random() * Game.map_grid.height);

		if (this.occupied[x][y]) {
			continue;
		} else {
			try {
				Game.mapObjects[x][y].push(Crafty.e('Port').at(x, y));
				this.occupied[x][y] = true;
			} catch(err) {
				console.log(x, y);
			}
		}
	}

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