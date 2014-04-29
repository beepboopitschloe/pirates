Crafty.scene('Game', function(load) {
	if (load && Crafty.storage("World:stored")) {
		console.log('Loading');
		World.load();
	} else {
		World.unsave();
		World.createNew();
	}

	if (!Player.ready) {
		Player.init();
	}

	Crafty.background('rgb(125, 123, 249)');

	// this.parallax = Crafty.e('Parallax').attr({
	// 	x: -Crafty.viewport.x - Game.map_grid.tile.width,
	// 	y: -Crafty.viewport.y - Game.map_grid.tile.height
	// });
	// this.parallax.scrollOn('ViewportScroll');
	// console.log(this.parallax);

	this.spawnRate = 1/World.chunkWidth;
	this.counter = 0;

	this.spawnAndRemoveEnemies = this.bind('PlayerFinishMove', function() {
		this.counter++;

		if (this.counter == 25) {
			toRemove = [];
			for (var i = 0; i < Game.enemies.length; i++) {
				enemy = Game.enemies[i];
				eLoc = enemy.at();
				pLoc = Game.player.at();

				if (eLoc.x < pLoc.x - World.chunkWidth * 2
						|| eLoc.x > pLoc.x + World.chunkWidth * 2
						|| eLoc.y < pLoc.y - World.chunkHeight * 2
						|| eLoc.y > pLoc.y + World.chunkHeight * 2) {
					enemy.destroy();
					toRemove.push(enemy);
					console.log('despawn enemy due to farness');
				}
			}

			for (var i=0; i < toRemove.length; i++) {
				Game.enemies.remove(toRemove[i]);
			}

			this.counter = 0;
		}

		if (Game.enemies.length < Game.maxEnemies && Math.random() > this.spawnRate) {
			World.spawnEnemy();
		}
	});

	this.showVictory = this.bind('PortVisited', function() {
		if (!Crafty('Port').length) {
			Crafty.scene('GameOver', true);
		} else {
			gui.notify({
				text: 'Visiting port. Only ' + Crafty('Port').length + ' left to go!'
			});
		}
	});

	this.showWorldMap = this.bind('KeyDown', function(e) {
		if (String.fromCharCode(e.keyCode) == 'M') {
			World.toggleMapModal();
		}
	})

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

	World.save();

	this.unbind('PortVisited', this.showVictory);
	this.unbind('PlayerFinishMove', this.spawnAndRemoveEnemies);
	this.unbind('KeyDown', this.showWorldMap);
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
		window.location.reload(true);
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

	Crafty.load(['img/environment.gif',
			'img/playerFighter.png',
			'img/oceanTile.png',
			'gui/button.png',
			'gui/selector.png',
			'gui/title.png'], function() {
		Crafty.sprite(32, 'img/environment.gif', {
			spr_fortress: [0, 0],
			spr_island: [1, 0],
			spr_port: [0, 1],
			spr_player: [1, 1]
		});

		Crafty.sprite(128, 'img/playerFighter.png', {
			spr_fighter_tmp: [0, 0]
		});

		Crafty.sprite(190, 51, 'gui/button.png', {
			gui_btn: [0, 0],
			gui_btnPressed: [0, 1]
		});

		Crafty.sprite(27, 28, 'gui/selector.png', {
			gui_selector: [0, 0]
		});

		Crafty.sprite(640, 480, 'gui/title.png', {
			gui_title: [0, 0]
		});

		Crafty.scene('MainMenu');
	});
});