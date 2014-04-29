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