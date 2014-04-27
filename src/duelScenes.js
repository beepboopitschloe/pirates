Crafty.scene('Duel', function(enemy) {
	// var layer = new NeuronLayer(3, 3);
	var duelStage = Crafty.e('2D, Canvas, Color')
						.attr({ x: Game.duelStage.x,
							y: Game.duelStage.y,
							w: Game.duelStage.w,
							h: Game.duelStage.h })
						.color('rgb(200, 50, 100)');

	console.log(Game.duelStage);

	var fighter = Crafty.e('FighterBrainPlayer');
	fighter.attr({x:Game.viewportWidth()/2, y:Game.viewportHeight()/2});
	fighter.x -= fighter.w - 4;
	fighter.facing = 1;

	var opponent = Crafty.e('FighterBrainRandom')
					.attr({x:Game.viewportWidth()/2, y:Game.viewportHeight()/2})
					.flip('X');
	opponent.x -= 4;
	opponent.facing = -1;

	this.hintText = null;

	this.showHints = this.bind('FighterAction', function(data) {
		fighter = data.fighter;

		if (fighter.has('FighterBrainPlayer'))
			return;

		if (this.hintText)
			this.hintText.destroy();

		this.hintText = (Crafty.e('2D, DOM, Text')
					.attr({
						x: fighter.x < Game.viewportWidth()/2?
							Game.viewportWidth()/2-128 : Game.viewportWidth()/2+128,
						y: Game.viewportHeight()/3
					})
					.text(data.action))
					.textFont({ size: '24px', family: 'Arial'})
					.textColor('#990099', 1.0);	
	});

	this.resolve = this.bind('FighterLost', function(loser) {
		Crafty.scene('Game');
	});
}, function() {
	this.unbind('FighterAction', this.showHints);
	this.unbind('FighterLost', this.resolve);
});