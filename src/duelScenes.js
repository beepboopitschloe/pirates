Crafty.scene('Duel', function(enemy) {
	// var layer = new NeuronLayer(3, 3);
	var duelStage = Crafty.e('2D, Canvas, Color')
						.attr({ x: Game.duelStage.x,
							y: Game.duelStage.y,
							w: Game.duelStage.w,
							h: Game.duelStage.h })
						.color('rgb(200, 50, 100)');

	var fighter = Crafty.e('FighterBrainPlayer');
	fighter.attr({x:Game.viewportWidth()/2, y:Game.viewportHeight()/2});
	fighter.x -= fighter.w - 4;
	fighter.facing = 1;

	var opponent = Crafty.e('FighterBrainRandom')
					.attr({x:Game.viewportWidth()/2, y:Game.viewportHeight()/2})
					.flip('X');
	opponent.x -= 4;
	opponent.facing = -1;

	fighter.controlsCombat = true;

	this.resolve = this.bind('FighterLost', function(loser) {
		if (loser.has && loser.has('FighterBrainPlayer')) {
			Player.crew(Player.crew() - 1);
		} else {
			Player.money(Player.money() + 75);
		}

		Crafty.scene('Game', true);
	});
}, function() {
	this.unbind('FighterLost', this.resolve);
});

Crafty.scene('DuelNeural', function(enemy) {
	var duelStage = Crafty.e('2D, Canvas, Color')
						.attr({ x: Game.duelStage.x,
							y: Game.duelStage.y,
							w: Game.duelStage.w,
							h: Game.duelStage.h })
						.color('rgb(200, 50, 100)');

	var fighter = Crafty.e('FighterBrainPlayer');
	fighter.attr({x:Game.viewportWidth()/2, y:Game.viewportHeight()/2});
	fighter.x -= fighter.w - 4;
	fighter.facing = 1;

	var opponent = Crafty.e('FighterBrainNeural')
					.attr({x:Game.viewportWidth()/2, y:Game.viewportHeight()/2})
					.flip('X')
					.setBrain(SuperBrain);
	opponent.x -= 4;
	opponent.facing = -1;

	fighter.controlsCombat = true;

	this.resolve = this.bind('FighterLost', function(loser) {
		if (loser.has && loser.has('FighterBrainPlayer')) {
			Player.crew(Player.crew() - 1);
		} else {
			Player.money(Player.money() + 75);
		}

		Crafty.scene('Game', true);
	});
}, function() {
	this.unbind('FighterLost', this.resolve);
});

Crafty.scene('FightingRing', function(data) {
	var port = data.port || null,
		level = data.level || 1;

	var duelStage = Crafty.e('2D, Canvas, Color')
						.attr({ x: Game.duelStage.x,
							y: Game.duelStage.y,
							w: Game.duelStage.w,
							h: Game.duelStage.h })
						.color('rgb(100, 50, 200)');

	var fighter = Crafty.e('FighterBrainPlayer');
	fighter.attr({x:Game.viewportWidth()/2, y:Game.viewportHeight()/2});
	fighter.x -= fighter.w - 4;
	fighter.facing = 1;

	var opponent = Crafty.e('FighterBrainRandom')
					.attr({x:Game.viewportWidth()/2, y:Game.viewportHeight()/2})
					.flip('X');
	opponent.x -= 4;
	opponent.facing = -1;

	fighter.controlsCombat = true;

	this.resolve = this.bind('FighterLost', function(loser) {
		if (loser.has && loser.has('FighterBrainPlayer')) {
			Crafty.scene('FightingRingMenu', {port: port, level: level, lost: true});
		} else {
			Crafty.scene('FightingRingMenu', {port: port, level: level, lost: false});
		}
	});
}, function() {
	this.unbind('FighterLost', this.resolve);
});

Crafty.scene('PrisonerDuel', function(port) {
	// var layer = new NeuronLayer(3, 3);
	var duelStage = Crafty.e('2D, Canvas, Color')
						.attr({ x: Game.duelStage.x,
							y: Game.duelStage.y,
							w: Game.duelStage.w,
							h: Game.duelStage.h })
						.color('rgb(100, 50, 100)');

	var fighter = Crafty.e('FighterBrainPlayer');
	fighter.attr({x:Game.viewportWidth()/2, y:Game.viewportHeight()/2});
	fighter.x -= fighter.w - 4;
	fighter.facing = 1;

	var opponent = Crafty.e('FighterBrainRandom')
					.attr({x:Game.viewportWidth()/2, y:Game.viewportHeight()/2})
					.flip('X');
	opponent.x -= 4;
	opponent.facing = -1;

	fighter.controlsCombat = true;

	this.resolve = this.bind('FighterLost', function(loser) {
		if (loser.has && loser.has('FighterBrainPlayer')) {
			if (Player.money() >= 100) {
				Player.money(Player.money() - 100);
			} else {
				Player.money(0);
			}

			gui.notify({
				type: 'warning',
				text: 'You lost the fight and $100.'
			});
		} else {
			Player.crew(Player.crew() + 1);
			Player.money(Player.money() + 150);
			port.hasPrisoner = false;
			gui.notify({
				type: 'success',
				heading: 'Prisoner rescued!',
				text: 'Just ' + Game.numPrisonersLeft() + ' to go! Plus, you got $150!'
			});
		}

		console.log(port.hasPrisoner);
		Crafty.scene('Game', true);
	});
}, function() {
	this.unbind('FighterLost', this.resolve);
});

Crafty.scene('PirateFortress', function(level) {
	if (!level)
		level = 1;

	var duelStage = Crafty.e('2D, Canvas, Color')
						.attr({ x: Game.duelStage.x,
							y: Game.duelStage.y,
							w: Game.duelStage.w,
							h: Game.duelStage.h })
						.color('rgb('+(100*level)+', 50, 100)');

	var out = Crafty.e('2D, DOM, Text')
						.attr({x: 128, y: 128, w: Game.viewportWidth()-256})
						.textFont({size: '24px', family: 'Courier'})
						.textColor('#ffffff')
						.text('Pirate Fortress Level ' + level);

	var out2 = Crafty.e('2D, DOM, Text')
						.attr({x: 128, y: 128+32, w: Game.viewportWidth()-256})
						.textFont({size: '16px', family: 'Courier'})
						.textColor('#eeeeee')
						.text('You have ' + Player.crew() + ' crew members remaining.');

	var fighter = Crafty.e('FighterBrainPlayer');
	fighter.attr({x:Game.viewportWidth()/2, y:Game.viewportHeight()/2});
	fighter.x -= fighter.w - 4;
	fighter.facing = 1;

	var opponent = Crafty.e('FighterBrainRandom')
					.attr({x:Game.viewportWidth()/2, y:Game.viewportHeight()/2})
					.flip('X');
	opponent.x -= 4;
	opponent.facing = -1;

	fighter.controlsCombat = true;

	setTimeout(function() {
		this.resolve = this.one('FighterLost', function(loser) {
			console.log(loser);
			if (loser.has && loser.has('FighterBrainPlayer')) {
				Player.crew(Player.crew() - 1);
				if (Player.crew() > 0) {
					Crafty.scene('PirateFortress', 1);
				} else {
					Crafty.scene('GameOver');
				}
			} else {
				console.log(++level);
				if (level > 3) {
					Crafty.scene('GameOver', true);
				}
				else {
					Crafty.scene('PirateFortress', level);
				}
			}
		});
	}.bind(this), 1);
}, function() {
	this.unbind('FighterLost', this.resolve);
});