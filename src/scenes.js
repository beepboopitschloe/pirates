Crafty.scene('Game', function() {
	World.init();

	Game.player = Crafty.e('PlayerCharacter').at(0, 0);
	Crafty.viewport.follow(Game.player, 0, 0);

	this.showVictory = this.bind('PortVisited', function() {
		if (!Crafty('Port').length) {
			Crafty.scene('GameOver', true);
		} else {
			gui.notify({
				text: 'Visiting port. Only ' + Crafty('Port').length + ' left to go!'
			});
		}
	});

	// this.cameraControl = this.bind('PlayerStartMove', function() {
	// 	var viewportLeft = -Crafty.viewport.x;
	// 	var viewportRight = (-Crafty.viewport.x) + (Crafty.viewport.width/Crafty.viewport._scale);
	// 	var viewportTop = -Crafty.viewport.y;
	// 	var viewportBottom = (-Crafty.viewport.y) + (Crafty.viewport.height/Crafty.viewport._scale);

	// 	var minX = viewportLeft + ((Crafty.viewport.width/Crafty.viewport._scale)/3);
	// 	var minY = viewportTop + ((Crafty.viewport.height/Crafty.viewport._scale)/3);
	// 	var maxX = viewportRight - ((Crafty.viewport.width/Crafty.viewport._scale)/3);
	// 	var maxY = viewportBottom - ((Crafty.viewport.width/Crafty.viewport._scale)/3);

	// 	if (Game.player.x < minX) {
	// 		// Crafty.viewport.scroll('x',
	// 		// 	-(Game.player.x + (Game.player.w / 2) - (Crafty.viewport.width / 2)));
	// 		Crafty.viewport.pan('x', -Game.map_grid.tile.width, Game.player.speed);
	// 	} else if (Game.player.x+Game.player.w > maxX) {
	// 		Crafty.viewport.pan('x', Game.map_grid.tile.width, Game.player.speed);
	// 	}

	// 	if (Game.player.y < minY) {
	// 		// Crafty.viewport.scroll('y',
	// 		// 	-(Game.player.y + (Game.player.h / 2) - (Crafty.viewport.height / 2)));
	// 		Crafty.viewport.pan('y', -Game.map_grid.tile.height, Game.player.speed);
	// 	} else if (Game.player.y > maxY) {	
	// 		Crafty.viewport.pan('y', Game.map_grid.tile.height, Game.player.speed);
	// 	}
	// });

}, function() {
	Crafty.viewport.x = 0;
	Crafty.viewport.y = 0;
	this.unbind('PortVisited', this.showVictory);
	this.unbind('PlayerMoved', this.cameraControl);
});

Crafty.scene('Map', function() {
	Crafty.e('2D, DOM, Text')
		.attr({ x: 0, y: 0, w: Game.viewportWidth() })
		.text("MAP SCREEN")
		.textFont({ size: '24px', family: 'Courier'})
		.textColor('#FFFFFF', 1.0)
		.css("text-align", "center");
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
		.attr({ x: 0, y: Game.viewportHeight()/3, w: Game.viewportWidth() })
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

	this.clickHandler = this.bind('Click', function(e) {
		console.log('lol', e);
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
		});

		Crafty.scene('Game');
	});
});