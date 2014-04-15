Crafty.scene('Duel', function() {
	// var layer = new NeuronLayer(3, 3);

	var fighter = Crafty.e('FighterBrainPlayer')
					.attr({x:64, y:64});

	var opponent = Crafty.e('FighterBrainAI')
					.attr({x:128, y:64})
					.flip('X');
}, function() {

});