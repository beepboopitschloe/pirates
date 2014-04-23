Crafty.scene('Duel', function(enemy) {
	// var layer = new NeuronLayer(3, 3);

	var fighter = Crafty.e('FighterBrainPlayer')
					.attr({x:Game.viewportWidth()/2-36, y:Game.viewportHeight()/2});
	fighter.facing = 1;

	var opponent = Crafty.e('FighterBrainRandom')
					.attr({x:Game.viewportWidth()/2+36, y:Game.viewportHeight()/2})
					.flip('X');
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
}, function() {
	this.unbind('FighterAction', this.showHints);
});