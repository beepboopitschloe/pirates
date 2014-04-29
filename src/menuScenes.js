Crafty.scene('MainMenu', function() {
	playBtn = Crafty.e('2D, Canvas, gui_btn, Mouse')
		.attr({
			x: Game.viewportWidth()/8,
			y: Game.viewportHeight()/3*2
		});

	playBtn.bind('KeyDown', function(e) {
		console.log('clicked');
		Crafty.scene('Game');
	});

	console.log(playBtn.mbr());
}, function() {

});